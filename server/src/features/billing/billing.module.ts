import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionOrmEntity } from './infrastructure/subscription.orm-entity';
import { ProcessedWebhookOrmEntity } from './infrastructure/processed-webhook.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { BillingController } from './controllers/billing.controller';
import { PaymentWebhooksController } from './controllers/payment-webhooks.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PlansModule } from '@/features/plans/plans.module';
import { PaymentModule } from '@/integrations/payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionOrmEntity,
      ProcessedWebhookOrmEntity,
      CompanyOrmEntity,
    ]),
    PlansModule,
    PaymentModule,
  ],
  controllers: [BillingController, PaymentWebhooksController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class BillingModule {}
