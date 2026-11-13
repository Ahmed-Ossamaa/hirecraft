import { BadRequestException } from '@nestjs/common';
import type Stripe from 'stripe';
import { StripePaymentProvider } from './stripe-payment-provider';
import { PaymentSubscriptionStatus } from '../domain/payment-provider.interface';

describe('StripePaymentProvider', () => {
  let provider: StripePaymentProvider;
  type StripeTestClient = {
    subscriptions: { retrieve: jest.Mock; update: jest.Mock };
    prices: { retrieve: jest.Mock };
    subscriptionSchedules: { retrieve: jest.Mock; update: jest.Mock };
    webhooks: { constructEvent: jest.Mock };
  };
  type ProviderInternals = {
    stripe: StripeTestClient;
    mapStripeStatus(
      status: Stripe.Subscription.Status,
    ): PaymentSubscriptionStatus;
  };
  let stripe: StripeTestClient;

  beforeEach(() => {
    provider = new StripePaymentProvider({
      secretKey: 'sk_test_placeholder',
      webhookSecret: 'whsec_placeholder',
      successUrl: '',
      cancelUrl: '',
    });
    stripe = {
      subscriptions: {
        retrieve: jest.fn(),
        update: jest.fn(),
      },
      prices: { retrieve: jest.fn() },
      subscriptionSchedules: {
        retrieve: jest.fn(),
        update: jest.fn(),
      },
      webhooks: { constructEvent: jest.fn() },
    };
    Object.defineProperty(provider, 'stripe', { value: stripe });
  });

  it.each<[Stripe.Subscription.Status, PaymentSubscriptionStatus]>([
    ['active', PaymentSubscriptionStatus.ACTIVE],
    ['trialing', PaymentSubscriptionStatus.TRIALING],
    ['past_due', PaymentSubscriptionStatus.PAST_DUE],
    ['unpaid', PaymentSubscriptionStatus.UNPAID],
    ['canceled', PaymentSubscriptionStatus.CANCELED],
    ['incomplete_expired', PaymentSubscriptionStatus.INCOMPLETE_EXPIRED],
  ])('normalizes Stripe status %s', (stripeStatus, expectedStatus) => {
    expect(
      (provider as unknown as ProviderInternals).mapStripeStatus(stripeStatus),
    ).toBe(expectedStatus);
  });

  it('normalizes invoice identity, billing reason, and renewal period', () => {
    const periodStart = 1793491200;
    const periodEnd = 1796083200;
    stripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_paid',
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_cycle',
          billing_reason: 'subscription_cycle',
          period_start: periodStart,
          period_end: periodEnd,
          parent: {
            type: 'subscription_details',
            subscription_details: { subscription: 'sub_1' },
          },
        },
      },
    });

    expect(
      provider.verifyWebhook({
        payload: Buffer.from('{}'),
        headers: { 'stripe-signature': 'test-signature' },
      }),
    ).toEqual(
      expect.objectContaining({
        subscriptionId: 'sub_1',
        invoice: {
          id: 'in_cycle',
          billingReason: 'SUBSCRIPTION_CYCLE',
          periodStart: new Date(periodStart * 1000),
          periodEnd: new Date(periodEnd * 1000),
        },
      }),
    );
  });

  it('schedules a future Stripe phase without changing the current subscription item', async () => {
    const now = Math.floor(Date.now() / 1000);
    const currentPeriodStart = now - 60;
    const currentPeriodEnd = now + 86400;
    const currentSubscription = {
      id: 'sub_1',
      customer: 'cus_1',
      status: 'active',
      cancel_at_period_end: false,
      created: currentPeriodStart,
      schedule: 'sched_1',
      items: {
        data: [
          {
            id: 'si_1',
            price: {
              id: 'price_pro',
              unit_amount: 300000,
              currency: 'egp',
              recurring: { interval: 'month' },
            },
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
          },
        ],
      },
    };
    stripe.subscriptions.retrieve.mockResolvedValue(currentSubscription);
    stripe.prices.retrieve.mockResolvedValue({
      id: 'price_starter',
      recurring: { interval: 'month', interval_count: 1 },
    });
    stripe.subscriptionSchedules.retrieve.mockResolvedValue({
      id: 'sched_1',
      phases: [
        {
          start_date: currentPeriodStart,
          end_date: currentPeriodEnd,
          automatic_tax: {
            enabled: true,
            disabled_reason: null,
            liability: null,
          },
          collection_method: 'charge_automatically',
          discounts: [
            {
              coupon: 'coupon_1',
              discount: null,
              promotion_code: null,
            },
          ],
          items: [
            {
              price: 'price_pro',
              quantity: 1,
              discounts: [
                {
                  coupon: 'item_coupon_1',
                  discount: null,
                  promotion_code: null,
                },
              ],
              metadata: { source: 'existing' },
              tax_rates: [{ id: 'tax_1' }],
            },
          ],
        },
      ],
    });
    stripe.subscriptionSchedules.update.mockResolvedValue({});

    await provider.scheduleDowngrade('sub_1', 'price_starter');

    expect(stripe.subscriptionSchedules.update).toHaveBeenCalledWith(
      'sched_1',
      expect.objectContaining({
        end_behavior: 'release',
        phases: [
          expect.objectContaining({
            start_date: currentPeriodStart,
            end_date: currentPeriodEnd,
            items: [
              expect.objectContaining({
                price: 'price_pro',
                quantity: 1,
                discounts: [
                  expect.objectContaining({ coupon: 'item_coupon_1' }),
                ],
                metadata: { source: 'existing' },
                tax_rates: ['tax_1'],
              }),
            ],
            automatic_tax: { enabled: true },
            collection_method: 'charge_automatically',
            discounts: [expect.objectContaining({ coupon: 'coupon_1' })],
          }),
          expect.objectContaining({
            start_date: currentPeriodEnd,
            items: [
              expect.objectContaining({
                price: 'price_starter',
                quantity: 1,
              }),
            ],
          }),
        ],
      }),
    );
    expect(stripe.subscriptions.update).not.toHaveBeenCalled();
  });

  it('rejects schedule creation when the subscription has no current phase', async () => {
    stripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_1',
      items: { data: [{ id: 'si_1' }] },
      schedule: 'sched_1',
    });
    stripe.subscriptionSchedules.retrieve.mockResolvedValue({
      id: 'sched_1',
      phases: [],
    });

    await expect(
      provider.scheduleDowngrade('sub_1', 'price_starter'),
    ).rejects.toThrow(BadRequestException);
  });
});
