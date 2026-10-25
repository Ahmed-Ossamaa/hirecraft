import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionLimitsService } from '../subscription-limits/subscription-limits.service';
import { CompanyMembersService } from '@/features/company-members/company-members.service';
import { JobsService } from '@/features/jobs/jobs.service';

@Injectable()
export class SubscriptionReconciliationService {
  private readonly logger = new Logger(SubscriptionReconciliationService.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionLimitsService: SubscriptionLimitsService,
    @Inject(forwardRef(() => CompanyMembersService))
    private readonly companyMembersService: CompanyMembersService,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
    private readonly dataSource: DataSource,
  ) {}

  @OnEvent('subscription.reconcile')
  async handleReconcileEvent(payload: { companyId: string }): Promise<void> {
    this.logger.log(
      `Received subscription.reconcile event for company ${payload.companyId}`,
    );
    await this.dataSource.transaction(async (tx) => {
      await this.reconcileCompanyResources(payload.companyId, tx);
    });
  }

  /**
   * Reconciles a company's active resources (published jobs and team members)
   * against its currently effective plan limits.
   *
   * Must be called within a transaction where the company row is locked.
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

    //Reconcile published jobs (keeps newest up to maxActiveJobs, closes excess older jobs)
    const closedJobs = await this.jobsService.closeExcessActiveJobs(
      companyId,
      subscription.plan.limits.maxActiveJobs,
      tx,
    );

    // Reconcile team members (revokes excess pending invites, deactivates excess active members)
    const { revokedPending, deactivatedActive } =
      await this.companyMembersService.reconcileExcessMembers(
        companyId,
        subscription.plan.limits.maxUsers,
        tx,
      );

    this.logger.log(
      `Reconciliation complete for company ${companyId}: closedJobs=${closedJobs}, revokedPending=${revokedPending}, deactivatedActive=${deactivatedActive}`,
    );

    return { closedJobs, revokedPending, deactivatedActive };
  }
}
