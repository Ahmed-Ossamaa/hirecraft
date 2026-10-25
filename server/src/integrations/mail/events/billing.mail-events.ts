export class SubscriptionCreatedEvent {
  constructor(
    public readonly email: string,
    public readonly companyName: string,
    public readonly planName: string,
    public readonly currentPeriodEnd: Date | null,
    public readonly recipientName?: string,
  ) {}
}

export class SubscriptionCancellationScheduledEvent {
  constructor(
    public readonly email: string,
    public readonly companyName: string,
    public readonly planName: string,
    public readonly currentPeriodEnd: Date | null,
    public readonly recipientName?: string,
  ) {}
}

export class SubscriptionDowngradeScheduledEvent {
  constructor(
    public readonly email: string,
    public readonly companyName: string,
    public readonly currentPlanName: string,
    public readonly targetPlanName: string,
    public readonly effectiveDate: Date | null,
    public readonly recipientName?: string,
  ) {}
}

export class SubscriptionExpiredEvent {
  constructor(
    public readonly email: string,
    public readonly companyName: string,
    public readonly planName: string,
    public readonly recipientName?: string,
  ) {}
}
