import { EntityManager } from 'typeorm';
import { Subscription } from './subscription.entity';
import { SubscriptionStatus } from './subscription-status.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface ISubscriptionRepository {
  findOneByCompanyIdAndStatus(
    companyId: string,
    status: SubscriptionStatus,
    tx?: EntityManager,
  ): Promise<Subscription | null>;

  findOneByProviderSubId(
    providerSubId: string,
    tx?: EntityManager,
  ): Promise<Subscription | null>;

  findSubscriptions(
    options: PageOptionsDto,
    status?: SubscriptionStatus,
    planId?: PlanId,
  ): Promise<PaginatedResult<Subscription>>;

  create(
    params: Partial<Subscription>,
    tx?: EntityManager,
  ): Promise<Subscription>;

  save(subscription: Subscription, tx?: EntityManager): Promise<Subscription>;
}
