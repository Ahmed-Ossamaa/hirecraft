import { SetMetadata } from '@nestjs/common';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

export const SUBSCRIPTION_PLANS_KEY = 'required_subscription_plans';

export const RequireSubscriptionPlan = (...plans: PlanId[]) =>
  SetMetadata(SUBSCRIPTION_PLANS_KEY, plans);
