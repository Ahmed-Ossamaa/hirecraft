import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionOrmEntity } from './infrastructure/subscription.orm-entity';
import { ProcessedWebhookOrmEntity } from './infrastructure/processed-webhook.orm-entity';
import { BillingController } from './controllers/billing.controller';
import { PaymentWebhooksController } from './controllers/payment-webhooks.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PlansModule } from '@/features/plans/plans.module';
import { PaymentModule } from '@/integrations/payment/payment.module';
import { SUBSCRIPTION_REPOSITORY } from './domain/subscription.repo.interface';
import { SubscriptionTypeormRepository } from './infrastructure/subscription.typeorm.repo';
import { CompaniesModule } from '@/features/companies/companies.module';
import { CompanyMembersModule } from '@/features/company-members/company-members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionOrmEntity,
      ProcessedWebhookOrmEntity,
    ]),
    PlansModule,
    PaymentModule,
    CompaniesModule,
    forwardRef(() => CompanyMembersModule),
  ],
  controllers: [BillingController, PaymentWebhooksController],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionTypeormRepository,
    },
    SubscriptionsService,
  ],
  exports: [SubscriptionsService],
})
export class BillingModule {}
