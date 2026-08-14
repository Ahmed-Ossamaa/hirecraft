import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IJobRepository,
  CreateJobParams,
  FindJobsFilters,
} from '../domain/job.repo.interface';
import { Job } from '../domain/job.entity';
import { JobOrmEntity } from './job.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class JobTypeormRepository implements IJobRepository {
  constructor(
    @InjectRepository(JobOrmEntity)
    private readonly repository: Repository<JobOrmEntity>,
  ) {}

  async create(params: CreateJobParams): Promise<Job> {
    const job = this.repository.create(params);
    const savedJob = await this.repository.save(job);
    return this.mapToDomain(savedJob);
  }

  async findAll(
    options: PageOptionsDto,
    filters?: FindJobsFilters,
  ): Promise<PaginatedResult<Job>> {
    const [jobs, total] = await this.repository.findAndCount({
      where: {
        status: filters?.status,
        companyId: filters?.companyId,
        experienceLevel: filters?.experienceLevel,
        jobType: filters?.jobType,
        country: filters?.country,
        city: filters?.city,
      },
      skip: options.skip,
      take: options.limit,
      order: {
        createdAt: options.order,
      },
    });

    return {
      data: jobs.map((job) => this.mapToDomain(job)),
      total,
      page: options.page!,
      limit: options.limit!,
    };
  }

  async findById(id: string): Promise<Job | null> {
    const job = await this.repository.findOne({ where: { id } });
    return job ? this.mapToDomain(job) : null;
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    const jobs = await this.repository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
    return jobs.map((job) => this.mapToDomain(job));
  }

  private mapToDomain(ormEntity: JobOrmEntity): Job {
    const job = new Job();
    Object.assign(job, ormEntity);
    return job;
  }
}
