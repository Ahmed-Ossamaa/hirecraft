import {
  Injectable,
  Inject,
  ConflictException,
  ForbiddenException,
  forwardRef,
} from '@nestjs/common';
import {
  JOB_APPLICATION_REPOSITORY,
  type JobApplicationRepositoryInterface,
} from './domain/job-application.repo.interface';
import { WorkerProfilesService } from '../worker-profiles/worker-profiles.service';
import { CreateJobApplicationDto } from './dto/apply-to-job.dto';
import { JobApplication } from './domain/job-application.entity';
import { JobsService } from '../jobs/jobs.service';
import { ApplicationStatus } from './domain/application-status.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class ApplicationsService {
  constructor(
    @Inject(JOB_APPLICATION_REPOSITORY)
    private readonly applicationRepo: JobApplicationRepositoryInterface,
    private readonly workerProfilesService: WorkerProfilesService,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
  ) {}

  async applyToJob(
    userId: string,
    dto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    const workerProfileId =
      await this.workerProfilesService.getProfileId(userId);

    const hasAlreadyApplied = await this.applicationRepo.exists(
      dto.jobId,
      workerProfileId,
    );

    if (hasAlreadyApplied) {
      throw new ConflictException('You have already applied to this job.');
    }

    return this.applicationRepo.create({
      jobId: dto.jobId,
      workerProfileId,
      coverLetter: dto.coverLetter,
    });
  }

  async getMyApplications(
    userId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<JobApplication>> {
    const profile = await this.workerProfilesService.getMyProfile(userId);

    return this.applicationRepo.findByWorkerProfileId(profile.id, options);
  }

  async updateStatus(
    applicationId: string,
    companyId: string,
    status: ApplicationStatus,
  ): Promise<JobApplication> {
    const isOwner = await this.applicationRepo.isEmployerOwner(
      applicationId,
      companyId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to modify this application.',
      );
    }
    const updatedApp = await this.applicationRepo.updateStatus(
      applicationId,
      status,
    );
    if (!updatedApp) {
      throw new Error('Application not found');
    }
    return updatedApp;
  }

  async getApplicationsForJob(
    jobId: string,
    companyId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<JobApplication>> {
    const job = await this.jobsService.getJobById(jobId);
    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'You do not have permission to view applications for this job.',
      );
    }

    return this.applicationRepo.findByJobId(jobId, options);
  }

  async getCountsForJobs(jobIds: string[]): Promise<Map<string, number>> {
    return this.applicationRepo.getCountsByJobIds(jobIds);
  }
}
