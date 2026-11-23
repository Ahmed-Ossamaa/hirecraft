import { Module, forwardRef } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobRepositoryModule } from './job-repository.module';
import { SubscriptionLimitsModule } from '../billing/subscription-limits/subscription-limits.module';
import { ApplicationsModule } from '../applications/applications.module';
import { BillingModule } from '../billing/billing.module';
import { SubscriptionPlanGuard } from '@/common/guards/subscription-plan.guard';

@Module({
  imports: [
    JobRepositoryModule,
    BillingModule,
    SubscriptionLimitsModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [JobsController],
  providers: [JobsService, SubscriptionPlanGuard],
  exports: [JobsService],
})
export class JobsModule {}
