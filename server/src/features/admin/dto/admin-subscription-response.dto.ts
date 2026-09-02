import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';

export class AdminSubscriptionResponseDto {
  id!: string;
  companyId!: string;
  planId!: string;
  provider!: string;
  status!: SubscriptionStatus;
  currentPeriodStart!: Date;
  currentPeriodEnd!: Date;
  cancelAtPeriodEnd!: boolean;
  createdAt!: Date;
}
