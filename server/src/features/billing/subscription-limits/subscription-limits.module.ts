import { Module } from '@nestjs/common';
import { SubscriptionLimitsService } from './subscription-limits.service';
import { BillingModule } from '../billing.module';

@Module({
  imports: [BillingModule],
  providers: [SubscriptionLimitsService],
  exports: [SubscriptionLimitsService],
})
export class SubscriptionLimitsModule {}
