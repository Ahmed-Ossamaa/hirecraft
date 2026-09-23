import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationOrmEntity } from './infrastructure/job-application.orm-entity';
import { JOB_APPLICATION_REPOSITORY } from './domain/job-application.repo.interface';
import { JobApplicationTypeormRepository } from './infrastructure/job-application.typeorm.repo';
import { WorkerProfilesModule } from '../worker-profiles/worker-profiles.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplicationOrmEntity]),
    WorkerProfilesModule,
    JobsModule,
  ],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    {
      provide: JOB_APPLICATION_REPOSITORY,
      useClass: JobApplicationTypeormRepository,
    },
  ],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
