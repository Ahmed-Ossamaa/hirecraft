import { Module } from '@nestjs/common';
import { WorkerProfilesService } from './worker-profiles.service';
import { WorkerProfilesController } from './worker-profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerProfileOrmEntity } from './infrastructure/worker-profile.orm-entity';
import { WorkerMachineSkillOrmEntity } from './infrastructure/worker-machine-skill.orm-entity';
import { WORKER_PROFILE_REPOSITORY } from './domain/worker-profile.repo.interface';
import { WorkerProfileTypeormRepository } from './infrastructure/worker-profile.typeorm.repo';
import { BillingModule } from '../billing/billing.module';
import { SubscriptionPlanGuard } from '@/common/guards/subscription-plan.guard';

@Module({
  imports: [
    BillingModule,
    TypeOrmModule.forFeature([
      WorkerProfileOrmEntity,
      WorkerMachineSkillOrmEntity,
    ]),
  ],
  controllers: [WorkerProfilesController],
  providers: [
    WorkerProfilesService,
    SubscriptionPlanGuard,
    {
      provide: WORKER_PROFILE_REPOSITORY,
      useClass: WorkerProfileTypeormRepository,
    },
  ],
  exports: [WORKER_PROFILE_REPOSITORY, WorkerProfilesService],
})
export class WorkerProfilesModule {}
