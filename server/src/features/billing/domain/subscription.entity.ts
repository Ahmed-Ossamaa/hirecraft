import { SubscriptionStatus } from './subscription-status.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

export class Subscription {
  id!: string;
  companyId!: string;
  provider!: string;
  providerSubId?: string | null;
  planId!: PlanId;
  status!: SubscriptionStatus;
  currentPeriodStart!: Date;
  currentPeriodEnd!: Date;
  cancelAtPeriodEnd!: boolean;
  scheduledPlanId?: PlanId | null;
  createdAt!: Date;
  updatedAt!: Date;
}
