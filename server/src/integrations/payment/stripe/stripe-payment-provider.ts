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

      return {
        id: stripeSub.id,
        customerId:
          typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer.id,
        status: this.mapStripeStatus(stripeSub.status),
        currentPeriodStart: new Date(
          (stripeSub.items.data[0]?.current_period_start ?? stripeSub.created) *
            1000,
        ),
        currentPeriodEnd: new Date(
          (stripeSub.items.data[0]?.current_period_end ?? stripeSub.created) *
            1000,
        ),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        priceId: stripeSub.items.data[0]?.price?.id || null,
      };
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
      const stripeSub = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        id: stripeSub.id,
        customerId:
          typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer.id,
        status: this.mapStripeStatus(stripeSub.status),
        currentPeriodStart: new Date(
          (stripeSub.items.data[0]?.current_period_start ?? stripeSub.created) *
            1000,
        ),
        currentPeriodEnd: new Date(
          (stripeSub.items.data[0]?.current_period_end ?? stripeSub.created) *
            1000,
        ),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        priceId: stripeSub.items.data[0]?.price?.id || null,
      };
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
        cancel_at_period_end: false,
      });

      return {
        id: stripeSub.id,
        customerId:
          typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer.id,
        status: this.mapStripeStatus(stripeSub.status),
        currentPeriodStart: new Date(
          (stripeSub.items.data[0]?.current_period_start ?? stripeSub.created) *
            1000,
        ),
        currentPeriodEnd: new Date(
          (stripeSub.items.data[0]?.current_period_end ?? stripeSub.created) *
            1000,
        ),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        priceId: stripeSub.items.data[0]?.price?.id || null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to upgrade subscription ${subscriptionId} to price ${newPriceId}.`,
        error instanceof Error ? error.stack : error,
      );
      if (error instanceof BadRequestException) throw error;
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
      });

      return {
        id: stripeSub.id,
        customerId:
          typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer.id,
        status: this.mapStripeStatus(stripeSub.status),
        currentPeriodStart: new Date(
          (stripeSub.items.data[0]?.current_period_start ?? stripeSub.created) *
            1000,
        ),
        currentPeriodEnd: new Date(
          (stripeSub.items.data[0]?.current_period_end ?? stripeSub.created) *
            1000,
        ),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        priceId: stripeSub.items.data[0]?.price?.id || null,
      };
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

    if (event.type.startsWith('customer.subscription.')) {
      const subscription = eventData as Stripe.Subscription;
      subscriptionId = subscription.id;
    } else if (
      eventData !== null &&
      typeof eventData === 'object' &&
      'id' in eventData &&
      typeof eventData.id === 'string'
    ) {
      subscriptionId = eventData.id;
    }

    return {
      id: event.id,
      provider: PaymentProviderName.STRIPE,
      type: mappedType,
      subscriptionId,
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

  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): PaymentSubscriptionStatus {
    switch (status) {
      case 'active':
      case 'trialing':
        return PaymentSubscriptionStatus.ACTIVE;
      case 'canceled':
        return PaymentSubscriptionStatus.CANCELED;
      case 'past_due':
        return PaymentSubscriptionStatus.PAST_DUE;
      case 'unpaid':
        return PaymentSubscriptionStatus.UNPAID;
      case 'incomplete':
      case 'incomplete_expired':
      case 'paused':
      default:
        return PaymentSubscriptionStatus.CANCELED;
    }
  }
}
