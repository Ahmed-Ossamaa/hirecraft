import { Module } from '@nestjs/common';
import { WorkerProfilesService } from './worker-profiles.service';
import { WorkerProfilesController } from './worker-profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerProfileOrmEntity } from './infrastructure/worker-profile.orm-entity';
import { WorkerMachineSkillOrmEntity } from './infrastructure/worker-machine-skill.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkerProfileOrmEntity,
      WorkerMachineSkillOrmEntity,
    ]),
  ],
  controllers: [WorkerProfilesController],
  providers: [WorkerProfilesService],
})
export class WorkerProfilesModule {}
