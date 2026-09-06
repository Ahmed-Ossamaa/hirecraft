import { Injectable, ForbiddenException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SubscriptionsService } from '../subscriptions.service';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';

@Injectable()
export class SubscriptionLimitsService {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async lockCompany(companyId: string, tx: EntityManager): Promise<void> {
    await tx.getRepository(CompanyOrmEntity).findOne({
      where: { id: companyId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async checkJobPostingLimit(
    companyId: string,
    currentCount: number,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    if (currentCount >= subscription.plan.limits.maxJobPostings) {
      throw new ForbiddenException(
        `Job posting limit reached for your ${subscription.plan.name} plan. Please upgrade to post more jobs.`,
      );
    }
  }

  async checkCompanyMemberLimit(
    companyId: string,
    currentCount: number,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    if (currentCount >= subscription.plan.limits.maxUsers) {
      throw new ForbiddenException(
        `Team member limit reached for your ${subscription.plan.name} plan. Please upgrade to invite more members.`,
      );
    }
  }
}
