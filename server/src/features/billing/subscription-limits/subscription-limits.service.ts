import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { SubscriptionsService } from '../services/subscriptions.service';
import {
  type IJobRepository,
  JOB_REPOSITORY,
} from '@/features/jobs/domain/job.repo.interface';
import {
  type ICompanyMemberRepository,
  COMPANY_MEMBER_REPOSITORY,
} from '@/features/company-members/domain/company-member.repo.interface';
import {
  type ICompanyRepository,
  COMPANY_REPOSITORY,
} from '@/features/companies/domain/company.repo.interface';
import {
  JOB_POSTING_USAGE_REPOSITORY,
  type IJobPostingUsageRepository,
} from '../domain/job-posting-usage.repo.interface';

@Injectable()
export class SubscriptionLimitsService {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(JOB_POSTING_USAGE_REPOSITORY)
    private readonly jobPostingUsageRepo: IJobPostingUsageRepository,
  ) {}

  /**
   * Acquires a pessimistic write lock on the company row.
   * Must be called first — before any limit check — to serialize concurrent
   * publish/invite operations for the same company and prevent race conditions.
   */
  async lockCompany(companyId: string, tx: EntityManager): Promise<void> {
    await this.companyRepository.lockForWrite(companyId, tx);
  }

  /**
   * Checks whether the company has room for one more active (published, non-expired) job.
   * Query: status = PUBLISHED AND expiresAt > NOW(), propagated inside tx.
   */
  async checkActiveJobLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const activeCount =
      await this.jobRepository.countPublishedActiveByCompanyId(companyId, tx);

    if (activeCount >= subscription.plan.limits.maxActiveJobs) {
      throw new ForbiddenException(
        `Active job limit reached for your ${subscription.plan.name} plan (${subscription.plan.limits.maxActiveJobs} active jobs). Please draft existing jobs or upgrade your plan to publish more simultaneously.`,
      );
    }
  }

  /**
   * Checks whether the company has remaining job-posting credits for the current billing period.
   * Queries the billing module's own JobPostingUsageRepository.
   * Transaction is propagated to ensure this count is consistent with the ongoing publish operation.
   */
  async checkJobPostingLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const postingCount = await this.jobPostingUsageRepo.countUsage(
      companyId,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
      tx,
    );

    if (postingCount >= subscription.plan.limits.maxJobPostings) {
      throw new ForbiddenException(
        `Job posting credit limit reached for your ${subscription.plan.name} plan (${subscription.plan.limits.maxJobPostings} posts per period). Please upgrade to post more jobs.`,
      );
    }
  }

  /**
   * Records that a job was published during the current billing period.
   * Delegated to the billing module's own JobPostingUsageRepository.
   * The write is done inside tx so it rolls back if the publish transaction fails.
   */
  async recordJobPostingUsage(
    companyId: string,
    jobId: string,
    tx: EntityManager,
  ): Promise<void> {
    await this.jobPostingUsageRepo.recordUsage(companyId, jobId, tx);
  }

  /**
   * Checks whether the company has room for one more reserved seat
   * (ACTIVE + PENDING members both consume a seat).
   * Query: status IN (ACTIVE, PENDING), propagated inside tx.
   */
  async checkCompanyMemberReservationLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const reservedCount =
      await this.companyMemberRepository.countReservedMembersByCompanyId(
        companyId,
        tx,
      );

    if (reservedCount >= subscription.plan.limits.maxUsers) {
      throw new ForbiddenException(
        `Team member limit reached for your ${subscription.plan.name} plan \n        (${subscription.plan.limits.maxUsers} seats). \n        Pending invitations also reserve seats.\n        Please revoke pending invitations or upgrade your plan.`,
      );
    }
  }

  /**
   * Checks whether the company has room for one more active member.
   * Query: status = ACTIVE only, propagated inside tx.
   */
  async checkCompanyMemberActiveLimit(
    companyId: string,
    tx: EntityManager,
  ): Promise<void> {
    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    const activeCount =
      await this.companyMemberRepository.countActiveMembersByCompanyId(
        companyId,
        tx,
      );

    if (activeCount >= subscription.plan.limits.maxUsers) {
      throw new ForbiddenException(
        `Active team member limit reached for your ${subscription.plan.name} plan (${subscription.plan.limits.maxUsers} active members). Please upgrade your plan to activate more members.`,
      );
    }
  }
}
