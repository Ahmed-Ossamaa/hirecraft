import { Module } from '@nestjs/common';
import { WorkerProfilesService } from './worker-profiles.service';
import { WorkerProfilesController } from './worker-profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerProfileOrmEntity } from './infrastructure/worker-profile.orm-entity';
import { WorkerMachineSkillOrmEntity } from './infrastructure/worker-machine-skill.orm-entity';
import { WORKER_PROFILE_REPOSITORY } from './domain/worker-profile.repo.interface';
import { WorkerProfileTypeormRepository } from './infrastructure/worker-profile.typeorm.repo';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkerProfileOrmEntity,
      WorkerMachineSkillOrmEntity,
    ]),
  ],
  controllers: [WorkerProfilesController],
  providers: [
    WorkerProfilesService,
    {
      provide: WORKER_PROFILE_REPOSITORY,
      useClass: WorkerProfileTypeormRepository,
    },
  ],
  exports: [WORKER_PROFILE_REPOSITORY],
})
export class WorkerProfilesModule {}
