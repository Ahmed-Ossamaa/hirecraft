import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOrmEntity } from './infrastructure/job.orm-entity';
import { JOB_REPOSITORY } from './domain/job.repo.interface';
import { JobTypeormRepository } from './infrastructure/job.typeorm.repo';

@Module({
  imports: [TypeOrmModule.forFeature([JobOrmEntity])],
  providers: [
    {
      provide: JOB_REPOSITORY,
      useClass: JobTypeormRepository,
    },
  ],
  exports: [JOB_REPOSITORY, TypeOrmModule],
})
export class JobRepositoryModule {}
