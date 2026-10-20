import { JobApplication } from './job-application.entity';
import { ApplicationStatus } from './application-status.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { GetJobApplicationsQueryDto } from '../dto/get-job-applications-query.dto';
import { JobApplicationStatsDto } from '../dto/job-application-stats.dto';

export const JOB_APPLICATION_REPOSITORY = Symbol('JOB_APPLICATION_REPOSITORY');

export interface CreateJobApplicationParams {
  jobId: string;
  workerProfileId: string;
  coverLetter?: string;
}

export interface JobApplicationRepositoryInterface {
  /**
   * Worker: "Apply for a job"
   */
  create(params: CreateJobApplicationParams): Promise<JobApplication>;

  /**
   * get a specific application details by application id
   */
  findById(id: string): Promise<JobApplication | null>;

  /**
   * Employer: "Show everyone who applied to the job"
   */
  findByJobId(
    jobId: string,
    options: GetJobApplicationsQueryDto,
  ): Promise<PaginatedResult<JobApplication>>;

  /**
   * Worker: "Show all the jobs I applied to"
   */
  findByWorkerProfileId(
    workerProfileId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<JobApplication>>;

  /**
   * Employer: "Update applicant status"
   */
  updateStatus(id: string, status: ApplicationStatus): Promise<void>;

  /**
   * Employer: Archive or unarchive an applicant
   */
  updateArchiveStatus(id: string, isArchived: boolean): Promise<void>;

  /**
   * Employer: Star or unstar an applicant
   */
  updateStarredStatus(id: string, isStarred: boolean): Promise<void>;

  /**
   * Employer: statistics for a specific job
   */
  getStatsByJobId(jobId: string): Promise<JobApplicationStatsDto>;

  /**
   * Check if I have already applied to this job
   */
  exists(jobId: string, workerProfileId: string): Promise<boolean>;

  /**
   * Check if Employer has right to interact with this application
   */
  isEmployerOwner(applicationId: string, companyId: string): Promise<boolean>;

  /**
   * Get the number of applications for multiple jobs in a single batched query
   */
  getCountsByJobIds(jobIds: string[]): Promise<Map<string, number>>;
}
