export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export enum PaymentSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  INCOMPLETE = 'INCOMPLETE',
  INCOMPLETE_EXPIRED = 'INCOMPLETE_EXPIRED',
  PAUSED = 'PAUSED',
  UNSUPPORTED = 'UNSUPPORTED',
}

export interface PaymentSubscription {
  id: string;
  customerId: string;
  status: PaymentSubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
  unitAmount?: number | null;
  currency?: string | null;
  interval?: 'month' | 'year' | null;
}

export enum PaymentProviderName {
  STRIPE = 'stripe',
}

export enum PaymentEventType {
  CHECKOUT_COMPLETED = 'CHECKOUT_COMPLETED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_DELETED = 'SUBSCRIPTION_DELETED',
  INVOICE_PAID = 'INVOICE_PAID',
  INVOICE_PAYMENT_FAILED = 'INVOICE_PAYMENT_FAILED',
}

export interface PaymentEvent {
  id: string;
  provider: PaymentProviderName;
  type: PaymentEventType;
  subscriptionId?: string;
  clientReferenceId?: string;
}

export interface PaymentPriceDetails {
  priceId: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
  productName?: string;
  active: boolean;
}

export interface CheckoutSessionDetails {
  sessionId: string;
  paymentStatus: string;
  subscriptionId?: string;
  companyId?: string;
  customerId?: string;
}

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

  retrieveCheckoutSession(sessionId: string): Promise<CheckoutSessionDetails>;

  retrieveSubscription(subscriptionId: string): Promise<PaymentSubscription>;

  cancelSubscriptionAtPeriodEnd(
    subscriptionId: string,
  ): Promise<PaymentSubscription>;

  upgradeSubscription(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<PaymentSubscription>;

  scheduleDowngrade(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<PaymentSubscription>;

  verifyWebhook(params: {
    payload: Buffer;
    headers: Record<string, string | string[] | undefined>;
  }): PaymentEvent | null;

  getPrices(): Promise<Map<string, PaymentPriceDetails>>;
}
