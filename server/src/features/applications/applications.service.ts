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
import {
  ApplicationStatus,
  CandidateApplicationStatus,
} from './domain/application-status.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { CandidateApplicationResponseDto } from './dto/candidate-application-response.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @Inject(JOB_APPLICATION_REPOSITORY)
    private readonly applicationRepo: JobApplicationRepositoryInterface,
    private readonly workerProfilesService: WorkerProfilesService,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
  ) {}

  /**
   * @description : Worker applies to a job (should have worker profile and can apply twice to same ejob)
   * @param userId  worker-id
   * @param dto     CreateJobApplicationDto
   * @throws      {NotFoundException} if the worker profile does not exist
   * @throws      {ConflictException} if the worker has already applied to this job
   * @returns       JobApplication entity
   */
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
  ): Promise<PaginatedResult<CandidateApplicationResponseDto>> {
    const profileId = await this.workerProfilesService.getProfileId(userId);

    const paginatedResult = await this.applicationRepo.findByWorkerProfileId(
      profileId,
      options,
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((app) => this.mapToCandidateResponse(app)),
    };
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
    const isOwner = await this.jobsService.checkJobOwnership(jobId, companyId);
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to view applications for this job.',
      );
    }

    return this.applicationRepo.findByJobId(jobId, options);
  }

  async getCountsForJobs(jobIds: string[]): Promise<Map<string, number>> {
    return this.applicationRepo.getCountsByJobIds(jobIds);
  }

  //............. helpers..........................

  /**
   * Maps internal application lifecycle statuses to candidate-facing statuses.
   *
   * Hiring pipeline stages (such as shortlisted, interview scheduled, or offered)
   * are abstracted into broader candidate milestones (e.g. REVIEWED) to provide a simplified
   * view without exposing internal hiring workflows.
   * @param status - The internal domain application status
   * @returns The simplified candidate-facing status
   */
  private toCandidateStatus(
    status: ApplicationStatus,
  ): CandidateApplicationStatus {
    switch (status) {
      case ApplicationStatus.PENDING:
        return CandidateApplicationStatus.PENDING;

      case ApplicationStatus.SHORTLISTED:
      case ApplicationStatus.INTERVIEW_SCHEDULED:
      case ApplicationStatus.OFFERED:
        return CandidateApplicationStatus.REVIEWED;

      case ApplicationStatus.OFFER_ACCEPTED:
        return CandidateApplicationStatus.ACCEPTED;

      case ApplicationStatus.REJECTED:
      case ApplicationStatus.OFFER_DECLINED:
        return CandidateApplicationStatus.REJECTED;

      case ApplicationStatus.WITHDRAWN:
        return CandidateApplicationStatus.WITHDRAWN;

      default:
        throw new Error(`Unknown application status: ${status}`);
    }
  }

  /**
   * Maps JobApplication entity to CandidateApplicationResponseDto.
   */
  private mapToCandidateResponse(
    app: JobApplication,
  ): CandidateApplicationResponseDto {
    return {
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      companyId: app.companyId,
      status: this.toCandidateStatus(app.status),
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
