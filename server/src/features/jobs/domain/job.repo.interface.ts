import { Job } from './job.entity';
import { JobStatus } from './job-status.enum';
import { JobType } from './job-type.enum';
import { ExperienceLevel } from './exp-level.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

export const JOB_REPOSITORY = Symbol('JOB_REPOSITORY');

export type CreateJobParams = {
  companyId: string;
  authorId: string;
  title: string;
  description: string;

  machineCategoryId: string;
  machineId: string;
  country: string;
  city: string;
  experienceLevel: ExperienceLevel;
  yearsOfExperience?: number;

  status?: JobStatus;
  jobType?: JobType;
  salaryRange?: string;
};

export type FindJobsFilters = {
  search?: string;
  status?: JobStatus;
  companyId?: string;
  experienceLevel?: ExperienceLevel;
  yearsOfExperience?: number;
  jobType?: JobType;
  country?: string;
  city?: string;
};

export interface IJobRepository {
  create(params: CreateJobParams): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findByCompanyId(companyId: string): Promise<Job[]>;
  findAll(
    options: PageOptionsDto,
    filters?: FindJobsFilters,
  ): Promise<PaginatedResult<Job>>;
  update(id: string, params: Partial<CreateJobParams>): Promise<Job | null>;
  delete(id: string): Promise<boolean>;
}
