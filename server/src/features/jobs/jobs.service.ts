import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  type IJobRepository,
  JOB_REPOSITORY,
  CreateJobParams,
  FindJobsFilters,
} from './domain/job.repo.interface';
import { Job } from './domain/job.entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { JobStatus } from './domain/job-status.enum';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import { DataSource } from 'typeorm';
import { SubscriptionLimitsService } from '../billing/subscription-limits/subscription-limits.service';

import { ApplicationsService } from '../applications/applications.service';
import { JobWithStatsDto } from './dto/job-with-stats.dto';
import { forwardRef } from '@nestjs/common';

@Injectable()
export class JobsService {
  constructor(
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
    private readonly subscriptionLimitsService: SubscriptionLimitsService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => ApplicationsService))
    private readonly applicationsService: ApplicationsService,
  ) {}

  private async attachStats(
    result: PaginatedResult<Job>,
  ): Promise<PaginatedResult<JobWithStatsDto>> {
    if (result.data.length === 0) {
      return result as unknown as PaginatedResult<JobWithStatsDto>;
    }

    const jobIds = result.data.map((job) => job.id);
    const counts = await this.applicationsService.getCountsForJobs(jobIds);

    const dataWithStats = result.data.map((job) => {
      const dto = new JobWithStatsDto();
      Object.assign(dto, job);
      dto.applicationCount = counts.get(job.id) || 0;
      return dto;
    });

    return { ...result, data: dataWithStats };
  }

  async createJob(params: CreateJobParams): Promise<Job> {
    return this.dataSource.transaction(async (tx) => {
      await this.subscriptionLimitsService.lockCompany(params.companyId, tx);
      const currentCount = await this.jobRepository.countActiveByCompanyId(
        params.companyId,
        tx,
      );
      await this.subscriptionLimitsService.checkJobPostingLimit(
        params.companyId,
        currentCount,
        tx,
      );
      return this.jobRepository.create(params, tx);
    });
  }

  async findAllJobs(
    options: PageOptionsDto,
    filters?: FindJobsFilters,
  ): Promise<PaginatedResult<JobWithStatsDto>> {
    const result = await this.jobRepository.findAll(options, filters);
    return this.attachStats(result);
  }

  async findAllPublishedJobs(
    query: FindJobsQueryDto,
  ): Promise<PaginatedResult<Job>> {
    return this.jobRepository.findAll(query, {
      search: query.search,
      status: JobStatus.PUBLISHED,
      companyId: query.companyId,
      experienceLevel: query.experienceLevel,
      yearsOfExperience: query.yearsOfExperience,
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

  async getJobsByCompany(
    companyId: string,
    query: FindJobsQueryDto,
  ): Promise<PaginatedResult<JobWithStatsDto>> {
    const result = await this.jobRepository.findAll(query, {
      companyId: companyId,
      search: query.search,
      status: query.status,
      experienceLevel: query.experienceLevel,
      yearsOfExperience: query.yearsOfExperience,
      jobType: query.jobType,
      country: query.country,
      city: query.city,
    });
    return this.attachStats(result);
  }

  async updateJob(
    id: string,
    companyId: string,
    params: Partial<CreateJobParams>,
  ): Promise<Job> {
    const job = await this.getJobById(id);
    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'You do not have permission to update this job',
      );
    }
    const updated = await this.jobRepository.update(id, params);
    if (!updated) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return updated;
  }

  async updateJobStatus(
    id: string,
    companyId: string,
    status: JobStatus,
  ): Promise<Job> {
    return this.updateJob(id, companyId, { status });
  }

  async adminUpdateJobStatus(id: string, status: JobStatus): Promise<Job> {
    await this.getJobById(id);
    const updated = await this.jobRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return updated;
  }

  async deleteJob(id: string, companyId: string): Promise<void> {
    const job = await this.getJobById(id);
    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'You do not have permission to delete this job',
      );
    }
    const success = await this.jobRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }

  async adminDeleteJob(id: string): Promise<void> {
    await this.getJobById(id);
    const success = await this.jobRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }
}
