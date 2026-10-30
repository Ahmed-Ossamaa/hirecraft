import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { JobPostingUsageOrmEntity } from './job-posting-usage.orm-entity';
import { IJobPostingUsageRepository } from '../domain/job-posting-usage.repo.interface';

@Injectable()
export class JobPostingUsageTypeormRepository implements IJobPostingUsageRepository {
  constructor(
    @InjectRepository(JobPostingUsageOrmEntity)
    private readonly repository: Repository<JobPostingUsageOrmEntity>,
  ) {}

  async countUsage(
    companyId: string,
    periodStart?: Date | null,
    periodEnd?: Date | null,
    tx?: EntityManager,
  ): Promise<number> {
    const manager = tx || this.repository.manager;
    const qb = manager
      .getRepository(JobPostingUsageOrmEntity)
      .createQueryBuilder('usage')
      .where('usage.companyId = :companyId', { companyId });

    if (periodStart) {
      qb.andWhere('usage.publishedAt >= :start', { start: periodStart });
    }
    if (periodEnd) {
      qb.andWhere('usage.publishedAt < :end', { end: periodEnd });
    }

    return qb.getCount();
  }

  async recordUsage(
    companyId: string,
    jobId: string,
    tx?: EntityManager,
  ): Promise<void> {
    const manager = tx || this.repository.manager;
    const repo = manager.getRepository(JobPostingUsageOrmEntity);
    const usage = repo.create({
      companyId,
      jobId,
      publishedAt: new Date(),
    });
    await repo.save(usage);
  }
}
