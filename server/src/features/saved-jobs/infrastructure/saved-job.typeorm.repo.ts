import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ISavedJobRepository,
  CreateSavedJobParams,
} from '../domain/saved-job.repo.interface';
import { SavedJob } from '../domain/saved-job.entity';
import { SavedJobOrmEntity } from './saved-job.orm-entity';
import { Job } from '@/features/jobs/domain/job.entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class SavedJobTypeormRepository implements ISavedJobRepository {
  constructor(
    @InjectRepository(SavedJobOrmEntity)
    private readonly repository: Repository<SavedJobOrmEntity>,
  ) {}

  async save(params: CreateSavedJobParams): Promise<SavedJob> {
    const entity = this.repository.create(params);
    const saved = await this.repository.save(entity);
    return this.mapToDomain(saved);
  }

  async delete(userId: string, jobId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, jobId });
    return (result.affected ?? 0) > 0;
  }

  async exists(userId: string, jobId: string): Promise<boolean> {
    return this.repository.exists({
      where: { userId, jobId },
    });
  }

  /**
   * Return paginated saved jobs for user with specific projected columns
   * from job and company in a single efficient query with SQL joins.
   */
  async findAllByUser(
    userId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<SavedJob>> {
    const qb = this.repository
      .createQueryBuilder('savedJob')
      .where('savedJob.userId = :userId', { userId })
      .leftJoin('savedJob.job', 'job')
      .addSelect([
        'job.id',
        'job.companyId',
        'job.title',
        'job.country',
        'job.city',
        'job.jobType',
        'job.experienceLevel',
        'job.yearsOfExperience',
        'job.salaryRange',
        'job.status',
        'job.createdAt',
      ])
      .leftJoin('job.company', 'company')
      .addSelect(['company.id', 'company.name', 'company.logoUrl'])
      .orderBy('savedJob.createdAt', options.order || 'DESC')
      .skip(options.skip)
      .take(options.limit);

    const [records, total] = await qb.getManyAndCount();

    return {
      data: records.map((record) => this.mapToDomain(record)),
      total,
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: Math.ceil(total / (options.limit || 10)),
    };
  }

  private mapToDomain(orm: SavedJobOrmEntity): SavedJob {
    const savedJob = new SavedJob();
    savedJob.id = orm.id;
    savedJob.userId = orm.userId;
    savedJob.jobId = orm.jobId;
    savedJob.createdAt = orm.createdAt;

    if (orm.job) {
      const job = new Job();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { company, author, category, machine, ...columns } = orm.job;
      Object.assign(job, columns);

      if (company) {
        job.companyName = company.name;
        job.companyLogo = company.logoUrl ?? undefined;
      }

      savedJob.job = job;
    }

    return savedJob;
  }
}
