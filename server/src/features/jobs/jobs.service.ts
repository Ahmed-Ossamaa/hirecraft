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

@Injectable()
export class JobsService {
  constructor(
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
  ) {}

  async createJob(params: CreateJobParams): Promise<Job> {
    return this.jobRepository.create(params);
  }

  async findAllJobs(
    options: PageOptionsDto,
    filters?: FindJobsFilters,
  ): Promise<PaginatedResult<Job>> {
    return this.jobRepository.findAll(options, filters);
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
