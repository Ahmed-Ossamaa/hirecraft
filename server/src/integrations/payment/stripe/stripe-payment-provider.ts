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
  PaymentSubscription,
  PaymentEvent,
  PaymentProviderName,
  PaymentEventType,
  PaymentSubscriptionStatus,
} from '@/features/billing/domain/payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(StripePaymentProvider.name);

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
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
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

  verifyWebhook(params: {
    payload: Buffer;
    headers: Record<string, string | string[] | undefined>;
  }): PaymentEvent {
    const signature = params.headers['stripe-signature'];

    if (!signature) {
      this.logger.warn('Missing stripe-signature header.');
      throw new BadRequestException('Missing signature header');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        params.payload,
        signature,
        this.webhookSecret,
      );

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
          throw new BadRequestException(
            `Unhandled Stripe event type: ${event.type}`,
          );
      }

      return {
        id: event.id,
        provider: PaymentProviderName.STRIPE,
        type: mappedType,
        subscriptionId,
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.warn('Stripe webhook signature verification failed.');
      throw new BadRequestException('Invalid webhook signature.');
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
