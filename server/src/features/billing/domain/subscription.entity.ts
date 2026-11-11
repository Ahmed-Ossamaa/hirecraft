import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { SubscriptionStatus } from './subscription-status.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

export class Subscription {
  id!: string;
  companyId!: string;
  provider!: string;

  // Joined fields
  companyName?: string | null;
  companyLogo?: string | null;

  @Exclude()
  @ApiHideProperty()
  providerSubId?: string | null;

  planId!: PlanId;
  amount!: number;
  currency!: string;
  billingInterval!: 'month' | 'year';
  providerPriceId?: string | null;
  status!: SubscriptionStatus;
  currentPeriodStart!: Date;
  currentPeriodEnd!: Date;
  cancelAtPeriodEnd!: boolean;
  scheduledPlanId?: PlanId | null;
  createdAt!: Date;
  updatedAt!: Date;
}
