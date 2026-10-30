import { Module, forwardRef } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobRepositoryModule } from './job-repository.module';
import { SubscriptionLimitsModule } from '../billing/subscription-limits/subscription-limits.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    JobRepositoryModule,
    SubscriptionLimitsModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
