import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { JobsService } from '@/features/jobs/jobs.service';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionReconciliationService } from './subscription-reconciliation.service';

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly reconciliationService: SubscriptionReconciliationService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Daily midnight sweep (Egypt Time - Africa/Cairo)
   * Closes published jobs that passed their expiresAt timestamp.
   * Sweeps subscriptions that passed currentPeriodEnd, marks them EXPIRED,
   *    and triggers resource reconciliation (downgrading to Free tier limits).
   */
  @Cron('0 0 * * *', { timeZone: 'Africa/Cairo' })
  async handleDailyMidnightSweep(): Promise<void> {
    this.logger.log(
      'Executing daily midnight sweep for expired jobs and subscriptions...',
    );
    await this.runDailySweep();
  }

  /**
   *  sweeper.
   */
  async runDailySweep(now: Date = new Date()): Promise<{
    closedJobs: number;
    reconciledSubscriptions: number;
  }> {
    let closedJobs = 0;
    try {
      closedJobs = await this.jobsService.closeExpiredJobs(now);
      this.logger.log(
        `Job Expiration Sweep: closed ${closedJobs} jobs with expiresAt <= ${now.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to expire jobs during daily sweep', error);
    }

    let reconciledSubscriptions = 0;
    try {
      const expiredSubs =
        await this.subscriptionsService.findExpiredActiveSubscriptions(now);

      this.logger.log(
        `Subscription Expiration Sweep: found ${expiredSubs.length} active subscriptions past currentPeriodEnd`,
      );

      for (const sub of expiredSubs) {
        try {
          await this.dataSource.transaction(async (tx) => {
            await this.subscriptionsService.markSubscriptionExpired(sub, tx);
            await this.reconciliationService.reconcileCompanyResources(
              sub.companyId,
              tx,
            );
          });
          reconciledSubscriptions++;
          this.logger.log(
            `Successfully reconciled expired subscription ${sub.id} for company ${sub.companyId}`,
          );
        } catch (subErr) {
          this.logger.error(
            `Error reconciling expired subscription ${sub.id} for company ${sub.companyId}`,
            subErr,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to sweep expired subscriptions', error);
    }

    this.logger.log(
      `Daily sweep complete: closedJobs=${closedJobs}, reconciledSubscriptions=${reconciledSubscriptions}`,
    );

    return { closedJobs, reconciledSubscriptions };
  }
}
