import { Injectable, Logger, Inject } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionLimitsService } from '../subscription-limits/subscription-limits.service';
import {
  type IJobRepository,
  JOB_REPOSITORY,
} from '@/features/jobs/domain/job.repo.interface';
import {
  type ICompanyMemberRepository,
  COMPANY_MEMBER_REPOSITORY,
} from '@/features/company-members/domain/company-member.repo.interface';

@Injectable()
export class SubscriptionReconciliationService {
  private readonly logger = new Logger(SubscriptionReconciliationService.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionLimitsService: SubscriptionLimitsService,
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    private readonly dataSource: DataSource,
  ) {}

  @OnEvent('subscription.reconcile')
  async handleReconcileEvent(payload: { companyId: string }): Promise<void> {
    this.logger.log(
      `Received subscription.reconcile event for company ${payload.companyId}`,
    );
    try {
      await this.dataSource.transaction(async (tx) => {
        await this.reconcileCompanyResources(payload.companyId, tx);
      });
    } catch (error) {
      this.logger.error(
        `Failed to reconcile resources for company ${payload.companyId}`,
        error,
      );
    }
  }

  /**
   * Reconciles a company's active resources (published jobs and team members)
   * against its currently effective plan limits.
   *
   * Executes atomic, idempotent database updates sharing one transaction (tx).
   */
  async reconcileCompanyResources(
    companyId: string,
    tx: EntityManager,
  ): Promise<{
    closedJobs: number;
    revokedPending: number;
    deactivatedActive: number;
  }> {
    await this.subscriptionLimitsService.lockCompany(companyId, tx);

    const subscription =
      await this.subscriptionsService.getSubscriptionForCompany(companyId, tx);

    this.logger.log(
      `Reconciling company ${companyId} against ${subscription.plan.name} limits: maxActiveJobs=${subscription.plan.limits.maxActiveJobs}, maxUsers=${subscription.plan.limits.maxUsers}`,
    );

    const closedJobs = await this.jobRepository.closeExcessActiveJobs(
      companyId,
      subscription.plan.limits.maxActiveJobs,
      tx,
    );

    const memberResults =
      await this.companyMemberRepository.reconcileExcessMembers(
        companyId,
        subscription.plan.limits.maxUsers,
        tx,
      );

    this.logger.log(
      `Reconciliation complete for company ${companyId}: closedJobs=${closedJobs}, revokedPending=${memberResults.revokedPending}, deactivatedActive=${memberResults.deactivatedActive}`,
    );

    return {
      closedJobs,
      revokedPending: memberResults.revokedPending,
      deactivatedActive: memberResults.deactivatedActive,
    };
  }
}
