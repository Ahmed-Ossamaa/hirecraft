import { Module, forwardRef } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JOB_REPOSITORY } from './domain/job.repo.interface';
import { JobTypeormRepository } from './infrastructure/job.typeorm.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOrmEntity } from './infrastructure/job.orm-entity';
import { SubscriptionLimitsModule } from '../billing/subscription-limits/subscription-limits.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobOrmEntity]),
    SubscriptionLimitsModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    {
      provide: JOB_REPOSITORY,
      useClass: JobTypeormRepository,
    },
  ],
  exports: [JobsService],
})
export class JobsModule {}
