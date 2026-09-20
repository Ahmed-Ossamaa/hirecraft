export enum PaymentSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
}

export interface PaymentSubscription {
  id: string;
  customerId: string;
  status: PaymentSubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
}

export enum PaymentProviderName {
  STRIPE = 'stripe',
}

export enum PaymentEventType {
  CHECKOUT_COMPLETED = 'CHECKOUT_COMPLETED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_DELETED = 'SUBSCRIPTION_DELETED',
}

export interface PaymentEvent {
  id: string;
  provider: PaymentProviderName;
  type: PaymentEventType;
  subscriptionId?: string;
  clientReferenceId?: string;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export interface PaymentProvider {
  createCustomer(
    email: string,
    name: string,
    idempotencyKey?: string,
  ): Promise<{ id: string }>;

  createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    clientReferenceId: string;
    idempotencyKey?: string;
  }): Promise<{ url: string | null }>;

  retrieveSubscription(subscriptionId: string): Promise<PaymentSubscription>;

  cancelSubscriptionAtPeriodEnd(
    subscriptionId: string,
  ): Promise<PaymentSubscription>;

  verifyWebhook(params: {
    payload: Buffer;
    headers: Record<string, string | string[] | undefined>;
  }): PaymentEvent | null;
}
