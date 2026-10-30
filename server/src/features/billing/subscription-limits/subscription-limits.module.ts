import { Module } from '@nestjs/common';
import { SubscriptionLimitsService } from './subscription-limits.service';
import { SubscriptionReconciliationService } from '../services/subscription-reconciliation.service';
import { BillingSchedulerService } from '../services/billing-scheduler.service';
import { BillingModule } from '../billing.module';
import { CompaniesModule } from '@/features/companies/companies.module';
import { JobRepositoryModule } from '@/features/jobs/job-repository.module';
import { CompanyMemberRepositoryModule } from '@/features/company-members/company-member-repository.module';

@Module({
  imports: [
    BillingModule,
    CompaniesModule,
    JobRepositoryModule,
    CompanyMemberRepositoryModule,
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
