import { SubscriptionStatus } from './subscription-status.enum';

export class Subscription {
  id!: string;
  companyId!: string;
  provider!: string;
  providerSubId?: string | null;
  planId!: string;
  status!: SubscriptionStatus;
  currentPeriodStart!: Date;
  currentPeriodEnd!: Date;
  cancelAtPeriodEnd!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
