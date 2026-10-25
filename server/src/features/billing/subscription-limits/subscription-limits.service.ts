import { Injectable, ForbiddenException } from '@nestjs/common';
import { EntityManager, In, MoreThan } from 'typeorm';
import { SubscriptionsService } from '../services/subscriptions.service';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';
import { JobPostingUsageOrmEntity } from '../infrastructure/job-posting-usage.orm-entity';
import { CompanyMemberOrmEntity } from '@/features/company-members/infrastructure/company-member.orm-entity';
import { CompanyMemberStatus } from '@/features/company-members/domain/company-member-status.enum';

@Injectable()
export class SubscriptionLimitsService {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async lockCompany(companyId: string, tx: EntityManager): Promise<void> {
    await tx.getRepository(CompanyOrmEntity).findOne({
      where: { id: companyId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async checkActiveJobLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const activeCount = await tx.getRepository(JobOrmEntity).count({
      where: {
        companyId,
        status: JobStatus.PUBLISHED,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (activeCount >= subscription.plan.limits.maxActiveJobs) {
      throw new ForbiddenException(
        `Active job limit reached for your ${subscription.plan.name} plan (${subscription.plan.limits.maxActiveJobs} active jobs). Please draft existing jobs or upgrade your plan to publish more simultaneously.`,
      );
    }
  }

  async checkJobPostingLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const qb = tx
      .getRepository(JobPostingUsageOrmEntity)
      .createQueryBuilder('usage')
      .where('usage.companyId = :companyId', { companyId })
      .andWhere('usage.publishedAt >= :start', {
        start: subscription.currentPeriodStart,
      });

    if (subscription.currentPeriodEnd) {
      qb.andWhere('usage.publishedAt < :end', {
        end: subscription.currentPeriodEnd,
      });
    }

    const postingCount = await qb.getCount();

    if (postingCount >= subscription.plan.limits.maxJobPostings) {
      throw new ForbiddenException(
        `Job posting credit limit reached for your ${subscription.plan.name} plan (${subscription.plan.limits.maxJobPostings} posts per period). Please upgrade to post more jobs.`,
      );
    }
  }

  async recordJobPostingUsage(
    companyId: string,
    jobId: string,
    tx: EntityManager,
  ): Promise<void> {
    const repo = tx.getRepository(JobPostingUsageOrmEntity);
    const usage = repo.create({
      companyId,
      jobId,
      publishedAt: new Date(),
    });
    await repo.save(usage);
  }

  async checkCompanyMemberReservationLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const reservedCount = await tx.getRepository(CompanyMemberOrmEntity).count({
      where: {
        companyId,
        status: In([CompanyMemberStatus.ACTIVE, CompanyMemberStatus.PENDING]),
      },
    });

    if (reservedCount >= subscription.plan.limits.maxUsers) {
      throw new ForbiddenException(
        `Team member limit reached for your ${subscription.plan.name} plan 
        (${subscription.plan.limits.maxUsers} seats). 
        Pending invitations also reserve seats.
        Please revoke pending invitations or upgrade your plan.`,
      );
    }
  }

  async checkCompanyMemberActiveLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const activeCount = await tx.getRepository(CompanyMemberOrmEntity).count({
      where: {
        companyId,
        status: CompanyMemberStatus.ACTIVE,
      },
    });

    if (activeCount >= subscription.plan.limits.maxUsers) {
      throw new ForbiddenException(
        `Active team member limit reached for your ${subscription.plan.name} plan (${subscription.plan.limits.maxUsers} active members). Please upgrade your plan to activate more members.`,
      );
    }
  }
}
