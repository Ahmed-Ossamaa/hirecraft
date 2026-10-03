import { JobApplication } from './job-application.entity';
import { ApplicationStatus } from './application-status.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

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
    options: PageOptionsDto,
  ): Promise<PaginatedResult<JobApplication>>;

  /**
   * Worker: "Show all the jobs I applied to"
   */
  findByWorkerProfileId(
    workerProfileId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<JobApplication>>;

  /**
   * Employer: "Accept / Reject/ Archive/ etc.. this applicant"
   */
  updateStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<JobApplication | null>;

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
