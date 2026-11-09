import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';
import { ApplicationStatus } from '@/features/applications/domain/application-status.enum';

export interface TimeSeriesBucketPoint {
  date: string;
  candidates: number;
  employers: number;
  total: number;
}

export interface UserRoleCount {
  total: number;
  candidates: number;
  employers: number;
}

export interface SubscriptionBillingSnapshot {
  id: string;
  companyId: string;
  planId: PlanId;
  amount: number;
  currency: string;
  billingInterval: 'month' | 'year';
  providerPriceId?: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
}

export interface ApplicationStatusCount {
  status: ApplicationStatus;
  count: number;
}

export interface MachineryDemandSupplyPoint {
  machineId: string;
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  activeJobsDemand: number;
  distinctWorkersSupply: number;
  supplyToDemandRatio: number | null;
}
