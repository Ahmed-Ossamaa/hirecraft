import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  type IJobRepository,
  JOB_REPOSITORY,
  CreateJobParams,
} from './domain/job.repo.interface';
import { Job } from './domain/job.entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { JobStatus } from './domain/job-status.enum';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';

@Injectable()
export class JobsService {
  constructor(
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
  ) {}

  async createJob(params: CreateJobParams): Promise<Job> {
    return this.jobRepository.create(params);
  }

  async findAllPublishedJobs(
    query: FindJobsQueryDto,
  ): Promise<PaginatedResult<Job>> {
    return this.jobRepository.findAll(query, {
      status: JobStatus.PUBLISHED,
      companyId: query.companyId,
      experienceLevel: query.experienceLevel,
      jobType: query.jobType,
      country: query.country!,
      city: query.city!,
    });
  }

  async getJobById(id: string): Promise<Job> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async getJobsByCompany(companyId: string, options: PageOptionsDto) {
    return this.jobRepository.findAll(options, {
      companyId: companyId,
    });
  }
}
