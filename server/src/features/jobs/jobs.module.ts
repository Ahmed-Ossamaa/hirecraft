import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JOB_REPOSITORY } from './domain/job.repo.interface';
import { JobTypeormRepository } from './infrastructure/job.typeorm.repo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOrmEntity } from './infrastructure/job.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobOrmEntity])],
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
