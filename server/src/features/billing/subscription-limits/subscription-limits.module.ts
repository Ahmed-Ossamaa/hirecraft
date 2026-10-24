import { Module, forwardRef } from '@nestjs/common';
import { SubscriptionLimitsService } from './subscription-limits.service';
import { SubscriptionReconciliationService } from '../services/subscription-reconciliation.service';
import { BillingSchedulerService } from '../services/billing-scheduler.service';
import { BillingModule } from '../billing.module';
import { JobsModule } from '@/features/jobs/jobs.module';
import { CompanyMembersModule } from '@/features/company-members/company-members.module';

@Module({
  imports: [
    BillingModule,
    forwardRef(() => JobsModule),
    forwardRef(() => CompanyMembersModule),
  ],
  providers: [
    SubscriptionLimitsService,
    SubscriptionReconciliationService,
    BillingSchedulerService,
  ],
  exports: [
    SubscriptionLimitsService,
    SubscriptionReconciliationService,
    BillingSchedulerService,
  ],
})
export class SubscriptionLimitsModule {}
