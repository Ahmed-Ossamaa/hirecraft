import { EntityManager } from 'typeorm';
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
  create(params: CreateJobParams, tx?: EntityManager): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  exists(id: string, companyId?: string): Promise<boolean>;
  countActiveByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number>;
  findAll(
    options: PageOptionsDto,
    filters?: FindJobsFilters,
  ): Promise<PaginatedResult<Job>>;
  update(id: string, params: Partial<CreateJobParams>): Promise<void>;
  updateReturning(
    id: string,
    params: Partial<CreateJobParams>,
    companyId?: string,
  ): Promise<Job | null>;
  delete(id: string): Promise<boolean>;
}
