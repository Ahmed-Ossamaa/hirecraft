import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedJobOrmEntity } from './infrastructure/saved-job.orm-entity';
import { SAVED_JOB_REPOSITORY } from './domain/saved-job.repo.interface';
import { SavedJobTypeormRepository } from './infrastructure/saved-job.typeorm.repo';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJobsController } from './saved-jobs.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedJobOrmEntity]), JobsModule],
  controllers: [SavedJobsController],
  providers: [
    SavedJobsService,
    {
      provide: SAVED_JOB_REPOSITORY,
      useClass: SavedJobTypeormRepository,
    },
  ],
  exports: [SavedJobsService],
})
export class SavedJobsModule {}
