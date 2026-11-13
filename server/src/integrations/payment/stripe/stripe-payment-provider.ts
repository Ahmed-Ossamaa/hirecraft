import {
  Injectable,
  InternalServerErrorException,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import stripeConfig from '../../../config/stripe.config';
import Stripe from 'stripe';
import {
  PaymentProvider,
  PaymentPriceDetails,
  CheckoutSessionDetails,
  PaymentSubscription,
  PaymentEvent,
  PaymentProviderName,
  PaymentEventType,
  PaymentInvoiceBillingReason,
  PaymentSubscriptionStatus,
} from '../domain/payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(StripePaymentProvider.name);
  private cachedPrices: Map<string, PaymentPriceDetails> | null = null;
  private cacheExpiresAt: number = 0;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL

  constructor(
    @Inject(stripeConfig.KEY)
    private readonly config: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(this.config.secretKey, {
      apiVersion: '2026-07-29.dahlia',
    });

    this.webhookSecret = this.config.webhookSecret;
  }

  async createCustomer(
    email: string,
    name: string,
    idempotencyKey?: string,
  ): Promise<{ id: string }> {
    try {
      const params: Stripe.CustomerCreateParams = { email, name };
      const options: Stripe.RequestOptions = {};

      if (idempotencyKey) {
        options.idempotencyKey = idempotencyKey;
      }

      const customer = await this.stripe.customers.create(params, options);
      return { id: customer.id };
    } catch {
      throw new InternalServerErrorException(
        'Failed to create Stripe customer.',
      );
    }
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    clientReferenceId: string;
    idempotencyKey?: string;
  }): Promise<{ url: string | null }> {
    try {
      const session = await this.stripe.checkout.sessions.create(
        {
          customer: params.customerId,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: params.priceId,
              quantity: 1,
            },
          ],
          success_url: params.successUrl || this.config.successUrl,
          cancel_url: params.cancelUrl || this.config.cancelUrl,
          client_reference_id: params.clientReferenceId,
          subscription_data: {
            metadata: {
              companyId: params.clientReferenceId,
            },
          },
        },
        params.idempotencyKey
          ? { idempotencyKey: params.idempotencyKey }
          : undefined,
      );
      return { url: session.url };
    } catch (error) {
      this.logger.error(
        'Failed to create Stripe checkout session.',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to create Stripe checkout session.',
      );
    }
  }

  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<CheckoutSessionDetails> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        subscriptionId:
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id,
        companyId: session.client_reference_id ?? undefined,
        customerId:
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve checkout session ${sessionId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve checkout session details from payment provider.',
      );
    }
  }

  async retrieveSubscription(
    subscriptionId: string,
  ): Promise<PaymentSubscription> {
    try {
      const stripeSub =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      let cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
      if (stripeSub.schedule) {
        const schedule = await this.stripe.subscriptionSchedules.retrieve(
          typeof stripeSub.schedule === 'string'
            ? stripeSub.schedule
            : stripeSub.schedule.id,
        );
        cancelAtPeriodEnd ||= schedule.end_behavior === 'cancel';
      }

      return this.mapStripeSubscription(stripeSub, cancelAtPeriodEnd);
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve subscription from Stripe.',
      );
    }
  }

  async cancelSubscriptionAtPeriodEnd(
    subscriptionId: string,
  ): Promise<PaymentSubscription> {
    try {
      const existing = await this.stripe.subscriptions.retrieve(subscriptionId);
      if (existing.schedule) {
        const schedule = await this.stripe.subscriptionSchedules.retrieve(
          typeof existing.schedule === 'string'
            ? existing.schedule
            : existing.schedule.id,
        );
        const currentPhase = this.getCurrentSchedulePhase(schedule);

        await this.stripe.subscriptionSchedules.update(schedule.id, {
          end_behavior: 'cancel',
          proration_behavior: 'none',
          phases: [this.toSchedulePhaseParams(currentPhase)],
        });
      } else {
        await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      return this.retrieveSubscription(subscriptionId);
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription ${subscriptionId} at period end.`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to cancel subscription with payment provider.',
      );
    }
  }

  async upgradeSubscription(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<PaymentSubscription> {
    try {
      const existing = await this.stripe.subscriptions.retrieve(subscriptionId);
      const itemId = existing.items.data[0]?.id;

      if (!itemId) {
        throw new BadRequestException('Subscription has no items to update.');
      }

      const stripeSub = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: itemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'none',
        billing_cycle_anchor: 'now',
        payment_behavior: 'error_if_incomplete',
        cancel_at_period_end: false,
      });

      return this.mapStripeSubscription(stripeSub);
    } catch (error) {
      this.logger.error(
        `Failed to upgrade subscription ${subscriptionId} to price ${newPriceId}.`,
        error instanceof Error ? error.stack : error,
      );
      if (error instanceof BadRequestException) throw error;
      if (error instanceof Stripe.errors.StripeCardError) {
        throw new BadRequestException(
          `Upgrade payment failed: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Failed to upgrade subscription with payment provider.',
      );
    }
  }

  async scheduleDowngrade(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<PaymentSubscription> {
    try {
      const existing = await this.stripe.subscriptions.retrieve(subscriptionId);
      if (!existing.items.data.length) {
        throw new BadRequestException('Subscription has no items to update.');
      }

      const schedule = existing.schedule
        ? await this.stripe.subscriptionSchedules.retrieve(
            typeof existing.schedule === 'string'
              ? existing.schedule
              : existing.schedule.id,
          )
        : await this.stripe.subscriptionSchedules.create({
            from_subscription: subscriptionId,
          });
      const currentPhase = this.getCurrentSchedulePhase(schedule);

      const targetPrice = await this.stripe.prices.retrieve(newPriceId);
      if (
        !targetPrice.recurring ||
        (targetPrice.recurring.interval !== 'month' &&
          targetPrice.recurring.interval !== 'year')
      ) {
        throw new BadRequestException('Target plan price is not recurring.');
      }
      const interval: 'month' | 'year' =
        targetPrice.recurring.interval === 'year' ? 'year' : 'month';

      await this.stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: 'release',
        proration_behavior: 'none',
        phases: [
          this.toSchedulePhaseParams(currentPhase),
          this.toSchedulePhaseParams(currentPhase, {
            startDate: currentPhase.end_date,
            duration: {
              interval,
              interval_count: targetPrice.recurring.interval_count ?? 1,
            },
            priceId: newPriceId,
            includeTrial: false,
          }),
        ],
      });

      return this.retrieveSubscription(subscriptionId);
    } catch (error) {
      this.logger.error(
        `Failed to schedule downgrade for subscription ${subscriptionId} to price ${newPriceId}.`,
        error instanceof Error ? error.stack : error,
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Failed to schedule subscription downgrade with payment provider.',
      );
    }
  }

  verifyWebhook(params: {
    payload: Buffer;
    headers: Record<string, string | string[] | undefined>;
  }): PaymentEvent | null {
    const signature = params.headers['stripe-signature'];

    if (!signature) {
      this.logger.warn('Missing stripe-signature header.');
      throw new BadRequestException('Missing signature header');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        params.payload,
        signature,
        this.webhookSecret,
      );
    } catch {
      this.logger.warn('Stripe webhook signature verification failed.');
      throw new BadRequestException('Invalid webhook signature.');
    }

    let mappedType: PaymentEventType;

    switch (event.type) {
      case 'checkout.session.completed':
        mappedType = PaymentEventType.CHECKOUT_COMPLETED;
        break;

      case 'customer.subscription.created':
        mappedType = PaymentEventType.SUBSCRIPTION_CREATED;
        break;

      case 'customer.subscription.updated':
        mappedType = PaymentEventType.SUBSCRIPTION_UPDATED;
        break;

      case 'customer.subscription.deleted':
        mappedType = PaymentEventType.SUBSCRIPTION_DELETED;
        break;

      case 'invoice.paid':
        mappedType = PaymentEventType.INVOICE_PAID;
        break;

      case 'invoice.payment_failed':
        mappedType = PaymentEventType.INVOICE_PAYMENT_FAILED;
        break;

      default:
        if (
          event.type.startsWith('price.') ||
          event.type.startsWith('product.')
        ) {
          this.logger.log(
            `Invalidating Stripe price cache due to event: ${event.type}`,
          );
          this.cachedPrices = null;
          this.cacheExpiresAt = 0;
        }
        this.logger.debug(`Ignoring Stripe event: ${event.type}`);
        return null;
    }

    const eventData = event.data.object;
    let subscriptionId: string | undefined;
    let clientReferenceId: string | undefined;
    let invoiceContext:
      | {
          id: string;
          billingReason: PaymentInvoiceBillingReason;
          periodStart: Date;
          periodEnd: Date;
        }
      | undefined;

    if (event.type.startsWith('customer.subscription.')) {
      const subscription = eventData as Stripe.Subscription;
      subscriptionId = subscription.id;
      clientReferenceId = subscription.metadata?.companyId || undefined;
    } else if (event.type === 'checkout.session.completed') {
      const session = eventData as Stripe.Checkout.Session;
      subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;
      clientReferenceId = session.client_reference_id ?? undefined;
    } else if (
      event.type === 'invoice.paid' ||
      event.type === 'invoice.payment_failed'
    ) {
      const invoice = eventData as Stripe.Invoice;
      subscriptionId = this.extractInvoiceSubscriptionId(invoice);
      invoiceContext = {
        id: invoice.id,
        billingReason: this.mapInvoiceBillingReason(invoice.billing_reason),
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
      };
    }
    return {
      id: event.id,
      provider: PaymentProviderName.STRIPE,
      type: mappedType,
      subscriptionId,
      clientReferenceId,
      invoice: invoiceContext,
    };
  }

  async getPrices(): Promise<Map<string, PaymentPriceDetails>> {
    const now = Date.now();
    if (this.cachedPrices && now < this.cacheExpiresAt) {
      return this.cachedPrices;
    }

    try {
      const response = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
        limit: 100,
      });

      const priceMap = new Map<string, PaymentPriceDetails>();

      for (const p of response.data) {
        if (p.unit_amount === null || p.unit_amount === undefined) continue;

        const productName =
          typeof p.product === 'object' &&
          p.product !== null &&
          !('deleted' in p.product)
            ? p.product.name
            : undefined;

        const interval = p.recurring?.interval === 'year' ? 'year' : 'month';
        const unitAmount = p.unit_amount / 100;
        const currency = p.currency.toUpperCase();

        priceMap.set(p.id, {
          priceId: p.id,
          unitAmount,
          currency,
          interval,
          productName,
          active: p.active,
        });
      }

      this.cachedPrices = priceMap;
      this.cacheExpiresAt = now + this.CACHE_TTL_MS;
      this.logger.log(
        `Synchronized ${priceMap.size} active prices from Stripe.`,
      );
      return priceMap;
    } catch (error) {
      this.logger.error('Failed to retrieve prices from Stripe', error);
      if (this.cachedPrices) {
        return this.cachedPrices;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve plan pricing from payment provider.',
      );
    }
  }

  private mapStripeSubscription(
    stripeSub: Stripe.Subscription,
    cancelAtPeriodEnd = stripeSub.cancel_at_period_end,
  ): PaymentSubscription {
    const item = stripeSub.items?.data?.[0];
    const price = item?.price;
    const unitAmount =
      price?.unit_amount !== null && price?.unit_amount !== undefined
        ? price.unit_amount / 100
        : null;
    const currency = price?.currency ? price.currency.toUpperCase() : 'EGP';
    const interval = price?.recurring?.interval === 'year' ? 'year' : 'month';

    const periodStartUnix =
      item?.current_period_start ??
      (stripeSub as unknown as { current_period_start?: number })
        .current_period_start ??
      stripeSub.created;

    const periodEndUnix =
      item?.current_period_end ??
      (stripeSub as unknown as { current_period_end?: number })
        .current_period_end ??
      stripeSub.created;

    return {
      id: stripeSub.id,
      customerId:
        typeof stripeSub.customer === 'string'
          ? stripeSub.customer
          : stripeSub.customer.id,
      status: this.mapStripeStatus(stripeSub.status),
      currentPeriodStart: new Date(periodStartUnix * 1000),
      currentPeriodEnd: new Date(periodEndUnix * 1000),
      cancelAtPeriodEnd,
      priceId: price?.id || null,
      unitAmount,
      currency,
      interval,
    };
  }

  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): PaymentSubscriptionStatus {
    switch (status) {
      case 'active':
        return PaymentSubscriptionStatus.ACTIVE;
      case 'trialing':
        return PaymentSubscriptionStatus.TRIALING;
      case 'past_due':
        return PaymentSubscriptionStatus.PAST_DUE;
      case 'unpaid':
        return PaymentSubscriptionStatus.UNPAID;
      case 'canceled':
        return PaymentSubscriptionStatus.CANCELED;
      case 'incomplete':
        return PaymentSubscriptionStatus.INCOMPLETE;
      case 'incomplete_expired':
        return PaymentSubscriptionStatus.INCOMPLETE_EXPIRED;
      case 'paused':
        return PaymentSubscriptionStatus.PAUSED;
      default:
        this.logger.warn(
          `Unrecognized Stripe subscription status: ${String(status)}. Mapping to UNSUPPORTED.`,
        );
        return PaymentSubscriptionStatus.UNSUPPORTED;
    }
  }

  private getCurrentSchedulePhase(
    schedule: Stripe.SubscriptionSchedule,
  ): Stripe.SubscriptionSchedule.Phase {
    const now = Math.floor(Date.now() / 1000);
    const currentPhase = schedule.phases.find(
      (phase) => phase.start_date <= now && phase.end_date > now,
    );
    if (!currentPhase) {
      throw new BadRequestException(
        'Subscription has no current billing phase to schedule against.',
      );
    }
    return currentPhase;
  }

  private toSchedulePhaseParams(
    phase: Stripe.SubscriptionSchedule.Phase,
    options: {
      startDate?: number;
      duration?: Stripe.SubscriptionScheduleUpdateParams.Phase.Duration;
      priceId?: string;
      includeTrial?: boolean;
    } = {},
  ): Stripe.SubscriptionScheduleUpdateParams.Phase {
    return {
      start_date: options.startDate ?? phase.start_date,
      ...(options.duration
        ? { duration: options.duration }
        : { end_date: phase.end_date }),
      add_invoice_items: (phase.add_invoice_items ?? []).map((item) => ({
        price: this.getPriceId(item.price),
        quantity: item.quantity ?? undefined,
        discounts: (item.discounts ?? []).map((discount) =>
          this.toScheduleDiscountParams(discount),
        ),
        tax_rates: item.tax_rates?.map((taxRate) => taxRate.id),
      })),
      application_fee_percent: phase.application_fee_percent ?? undefined,
      automatic_tax: phase.automatic_tax
        ? {
            enabled: phase.automatic_tax.enabled,
            ...(phase.automatic_tax.liability
              ? {
                  liability: {
                    type: phase.automatic_tax.liability.type,
                    ...(phase.automatic_tax.liability.type === 'account'
                      ? {
                          account: this.getObjectId(
                            phase.automatic_tax.liability.account,
                          ),
                        }
                      : {}),
                  },
                }
              : {}),
          }
        : undefined,
      billing_cycle_anchor: phase.billing_cycle_anchor ?? undefined,
      billing_thresholds: phase.billing_thresholds
        ? {
            amount_gte: phase.billing_thresholds.amount_gte ?? undefined,
            reset_billing_cycle_anchor:
              phase.billing_thresholds.reset_billing_cycle_anchor ?? undefined,
          }
        : undefined,
      collection_method: phase.collection_method ?? undefined,
      currency: phase.currency,
      default_payment_method: this.getObjectId(
        phase.default_payment_method ?? undefined,
      ),
      default_tax_rates: phase.default_tax_rates?.map((taxRate) => taxRate.id),
      description: phase.description ?? undefined,
      discounts: (phase.discounts ?? []).map((discount) =>
        this.toScheduleDiscountParams(discount),
      ),
      invoice_settings: phase.invoice_settings
        ? {
            account_tax_ids: phase.invoice_settings.account_tax_ids
              ?.map((taxId) => this.getObjectId(taxId))
              .filter((taxId): taxId is string => !!taxId),
            custom_fields: phase.invoice_settings.custom_fields?.map(
              (field) => ({ name: field.name, value: field.value }),
            ),
            days_until_due: phase.invoice_settings.days_until_due ?? undefined,
            description: phase.invoice_settings.description ?? undefined,
            footer: phase.invoice_settings.footer ?? undefined,
            issuer: phase.invoice_settings.issuer
              ? {
                  type: phase.invoice_settings.issuer.type,
                  ...(phase.invoice_settings.issuer.type === 'account'
                    ? {
                        account: this.getObjectId(
                          phase.invoice_settings.issuer.account,
                        ),
                      }
                    : {}),
                }
              : undefined,
          }
        : undefined,
      items: phase.items.map((item, index) => ({
        price:
          options.priceId && index === 0
            ? options.priceId
            : this.getPriceId(item.price),
        quantity: item.quantity ?? undefined,
        billing_thresholds:
          item.billing_thresholds?.usage_gte != null
            ? { usage_gte: item.billing_thresholds.usage_gte }
            : undefined,
        discounts: (item.discounts ?? []).map((discount) =>
          this.toScheduleDiscountParams(discount),
        ),
        metadata: item.metadata ?? undefined,
        tax_rates: item.tax_rates?.map((taxRate) => taxRate.id),
      })),
      metadata: phase.metadata ?? undefined,
      on_behalf_of: this.getObjectId(phase.on_behalf_of),
      proration_behavior: 'none',
      transfer_data: phase.transfer_data
        ? {
            amount_percent: phase.transfer_data.amount_percent ?? undefined,
            destination: this.getRequiredObjectId(
              phase.transfer_data.destination,
            ),
          }
        : undefined,
      ...(options.includeTrial === false
        ? {}
        : {
            trial: phase.trial ?? undefined,
            trial_end: phase.trial_end ?? undefined,
          }),
    };
  }

  private toScheduleDiscountParams(
    discount: Stripe.SubscriptionSchedule.Phase.Discount,
  ): Stripe.SubscriptionScheduleUpdateParams.Phase.Discount {
    return {
      coupon: this.getObjectId(discount.coupon),
      discount: this.getObjectId(discount.discount),
      promotion_code: this.getObjectId(discount.promotion_code),
    };
  }

  private getObjectId(
    value: string | { id: string } | null | undefined,
  ): string | undefined {
    if (!value) return undefined;
    return typeof value === 'string' ? value : value.id;
  }

  private getRequiredObjectId(value: string | { id: string }): string {
    return typeof value === 'string' ? value : value.id;
  }

  private getPriceId(
    price: string | Stripe.Price | Stripe.DeletedPrice,
  ): string {
    return typeof price === 'string' ? price : price.id;
  }

  private extractInvoiceSubscriptionId(
    invoice: Stripe.Invoice,
  ): string | undefined {
    // 1. Modern Stripe API (2025+/Dahlia): on parent.subscription_details
    if (
      invoice.parent &&
      'subscription_details' in invoice.parent &&
      invoice.parent.subscription_details?.subscription
    ) {
      const sub = invoice.parent.subscription_details.subscription;
      return typeof sub === 'string' ? sub : sub.id;
    }

    // 2. Classic/Standard Stripe API: on root invoice.subscription
    const rootSub = (
      invoice as { subscription?: string | Stripe.Subscription | null }
    ).subscription;
    if (rootSub) {
      return typeof rootSub === 'string' ? rootSub : rootSub.id;
    }

    return undefined;
  }

  private mapInvoiceBillingReason(
    reason: Stripe.Invoice.BillingReason | null,
  ): PaymentInvoiceBillingReason {
    switch (reason) {
      case 'subscription_cycle':
        return PaymentInvoiceBillingReason.SUBSCRIPTION_CYCLE;
      case 'subscription_create':
        return PaymentInvoiceBillingReason.SUBSCRIPTION_CREATE;
      case 'subscription_update':
        return PaymentInvoiceBillingReason.SUBSCRIPTION_UPDATE;
      default:
        return PaymentInvoiceBillingReason.OTHER;
    }
  }
}
