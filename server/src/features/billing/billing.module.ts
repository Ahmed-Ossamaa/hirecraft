import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionOrmEntity } from './infrastructure/subscription.orm-entity';
import { ProcessedWebhookOrmEntity } from './infrastructure/processed-webhook.orm-entity';
import { BillingController } from './controllers/billing.controller';
import { PaymentWebhooksController } from './controllers/payment-webhooks.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { PlansModule } from '@/features/plans/plans.module';
import { PaymentModule } from '@/integrations/payment/payment.module';
import { SUBSCRIPTION_REPOSITORY } from './domain/subscription.repo.interface';
import { SubscriptionTypeormRepository } from './infrastructure/subscription.typeorm.repo';
import { CompaniesModule } from '@/features/companies/companies.module';
import { JobPostingUsageOrmEntity } from './infrastructure/job-posting-usage.orm-entity';
import { JobRepositoryModule } from '@/features/jobs/job-repository.module';
import { CompanyMemberRepositoryModule } from '@/features/company-members/company-member-repository.module';

import { JOB_POSTING_USAGE_REPOSITORY } from './domain/job-posting-usage.repo.interface';
import { JobPostingUsageTypeormRepository } from './infrastructure/job-posting-usage.typeorm.repo';
import { PROCESSED_WEBHOOK_REPOSITORY } from './domain/processed-webhook.repo.interface';
import { ProcessedWebhookTypeormRepository } from './infrastructure/processed-webhook.typeorm.repo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionOrmEntity,
      ProcessedWebhookOrmEntity,
      JobPostingUsageOrmEntity,
    ]),
    PlansModule,
    PaymentModule,
    CompaniesModule,
    JobRepositoryModule,
    CompanyMemberRepositoryModule,
  ],
  controllers: [BillingController, PaymentWebhooksController],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionTypeormRepository,
    },
    {
      provide: JOB_POSTING_USAGE_REPOSITORY,
      useClass: JobPostingUsageTypeormRepository,
    },
    {
      provide: PROCESSED_WEBHOOK_REPOSITORY,
      useClass: ProcessedWebhookTypeormRepository,
    },
    SubscriptionsService,
  ],
  exports: [
    SubscriptionsService,
    JOB_POSTING_USAGE_REPOSITORY,
    PROCESSED_WEBHOOK_REPOSITORY,
  ],
})
export class BillingModule {}
