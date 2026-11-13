import { Module } from '@nestjs/common';
import { AnalyticsModule } from '@/features/analytics/analytics.module';
import { BillingModule } from '@/features/billing/billing.module';
import { SubscriptionPlanGuard } from '@/common/guards/subscription-plan.guard';
import { CompaniesAnalyticsController } from './companies-analytics.controller';
import { CompaniesAnalyticsService } from './companies-analytics.service';

@Module({
  imports: [AnalyticsModule, BillingModule],
  controllers: [CompaniesAnalyticsController],
  providers: [CompaniesAnalyticsService, SubscriptionPlanGuard],
})
export class CompanyAnalyticsModule {}
