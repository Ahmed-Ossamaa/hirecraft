import { PlanId } from './plan-id.enum';

export type PlanInterval = 'month' | 'year';

export interface PlanLimits {
  maxJobPostings: number;
  maxUsers: number;
}

export class Plan {
  constructor(
    public readonly id: PlanId,
    public readonly name: string,
    public readonly interval: PlanInterval,
    public readonly paymentPriceId: string | null,
    public readonly limits: PlanLimits,
  ) {}

  get isFree(): boolean {
    return this.paymentPriceId === null;
  }
}
