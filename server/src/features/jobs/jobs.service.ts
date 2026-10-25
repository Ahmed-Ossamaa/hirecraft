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
import { DataSource, EntityManager } from 'typeorm';
import { SubscriptionLimitsService } from '../billing/subscription-limits/subscription-limits.service';

import { ApplicationsService } from '../applications/applications.service';
import { JobWithStatsDto } from './dto/job-with-stats.dto';
import { forwardRef } from '@nestjs/common';

@Injectable()
export class JobsService {
  constructor(
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
    @Inject(forwardRef(() => SubscriptionLimitsService))
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
    const jobParams: CreateJobParams = {
      ...params,
      status: JobStatus.DRAFT,
      publishedAt: null,
      expiresAt: null,
    };
    return this.jobRepository.create(jobParams);
  }

  async closeExcessActiveJobs(
    companyId: string,
    keepCount: number,
    tx: EntityManager,
  ): Promise<number> {
    return this.jobRepository.closeExcessActiveJobs(companyId, keepCount, tx);
  }

  async closeExpiredJobs(
    now: Date = new Date(),
    tx?: EntityManager,
  ): Promise<number> {
    return this.jobRepository.closeExpiredJobs(now, tx);
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
    // Content update only: strip status and publication timestamp parameters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, publishedAt, expiresAt, ...contentParams } = params;

    const updated = await this.jobRepository.updateReturning(
      id,
      contentParams,
      companyId,
    );

    if (!updated) {
      throw new NotFoundException(
        `Job with ID ${id} not found or you don't have permission`,
      );
    }

    return updated;
  }

  async updateJobStatus(
    id: string,
    companyId: string,
    status: JobStatus,
  ): Promise<Job> {
    if (status === JobStatus.CLOSED) {
      throw new ForbiddenException(
        'Companies cannot manually close jobs. Please move the job to DRAFT instead.',
      );
    }

    return this.dataSource.transaction(async (tx) => {
      const currentJob = await this.jobRepository.findById(id, tx);
      if (!currentJob || currentJob.companyId !== companyId) {
        throw new NotFoundException(
          `Job with ID ${id} not found or you don't have permission`,
        );
      }

      if (currentJob.status === status) {
        return currentJob;
      }

      const isPublishing = status === JobStatus.PUBLISHED;
      const statusParams: Partial<CreateJobParams> = { status };

      if (isPublishing) {
        await this.subscriptionLimitsService.lockCompany(companyId, tx);
        await this.subscriptionLimitsService.checkActiveJobLimit(companyId, tx);
        await this.subscriptionLimitsService.checkJobPostingLimit(
          companyId,
          tx,
        );

        statusParams.publishedAt = new Date();
        statusParams.expiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        );
      }

      const updated = await this.jobRepository.updateReturning(
        id,
        statusParams,
        companyId,
        tx,
      );

      if (!updated) {
        throw new NotFoundException(
          `Job with ID ${id} not found or you don't have permission`,
        );
      }

      if (isPublishing) {
        await this.subscriptionLimitsService.recordJobPostingUsage(
          companyId,
          id,
          tx,
        );
      }

      return updated;
    });
  }

  async adminUpdateJobStatus(id: string, status: JobStatus): Promise<Job> {
    const params: Partial<CreateJobParams> = { status };
    if (status === JobStatus.PUBLISHED) {
      params.publishedAt = new Date();
      params.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const updated = await this.jobRepository.updateReturning(id, params);
    if (!updated) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return updated;
  }

  async deleteJob(id: string, companyId: string): Promise<void> {
    const isOwner = await this.jobRepository.exists(id, companyId);
    if (!isOwner) {
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
    const exists = await this.jobRepository.exists(id);
    if (!exists) throw new NotFoundException(`Job with ID ${id} not found`);
    const success = await this.jobRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }

  async checkJobOwnership(id: string, companyId: string): Promise<boolean> {
    return this.jobRepository.exists(id, companyId);
  }
}
