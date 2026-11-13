import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SubscriptionsService } from '@/features/billing/services/subscriptions.service';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import type { JwtUser } from '@/common/types/jwt.types';
import { SUBSCRIPTION_PLANS_KEY } from '../decorators/subscription-plan.decorator';

type AuthenticatedRequest = Request & { user?: JwtUser };

@Injectable()
export class SubscriptionPlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<PlanId[]>(
      SUBSCRIPTION_PLANS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPlans?.length) {
      throw new ForbiddenException(
        'Subscription plan requirements are not configured.',
      );
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const companyId = request.user?.companyId;
    if (!companyId) {
      throw new ForbiddenException('User is not associated with a company.');
    }

    const plan = await this.subscriptionsService.getCompanyPlan(companyId);
    if (!requiredPlans.includes(plan.id)) {
      throw new ForbiddenException(
        'Your subscription plan does not include this feature.',
      );
    }

    return true;
  }
}
