import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { SubscriptionOrmEntity } from '@/features/billing/infrastructure/subscription.orm-entity';
import { JobApplicationOrmEntity } from '@/features/applications/infrastructure/job-application.orm-entity';
import { MachineOrmEntity } from '@/features/machines/infrastructure/machine.orm-entity';
import { ANALYTICS_READ_REPOSITORY } from './domain/repositories/analytics-read.repo.interface';
import { TypeOrmAnalyticsReadRepository } from './infrastructure/typeorm-analytics-read.repo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      JobOrmEntity,
      SubscriptionOrmEntity,
      JobApplicationOrmEntity,
      MachineOrmEntity,
    ]),
  ],
  providers: [
    {
      provide: ANALYTICS_READ_REPOSITORY,
      useClass: TypeOrmAnalyticsReadRepository,
    },
  ],
  exports: [ANALYTICS_READ_REPOSITORY],
})
export class AnalyticsModule {}
