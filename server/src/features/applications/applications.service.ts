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
import { GetJobApplicationsQueryDto } from './dto/get-job-applications-query.dto';
import { JobApplicationStatsDto } from './dto/job-application-stats.dto';
import { EmployerApplicationResponseDto } from './dto/employer-application-response.dto';

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
  ): Promise<void> {
    const isOwner = await this.applicationRepo.isEmployerOwner(
      applicationId,
      companyId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to modify this application.',
      );
    }
    await this.applicationRepo.updateStatus(applicationId, status);
  }

  async updateArchiveStatus(
    applicationId: string,
    companyId: string,
    isArchived: boolean,
  ): Promise<void> {
    const isOwner = await this.applicationRepo.isEmployerOwner(
      applicationId,
      companyId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to modify this application.',
      );
    }
    await this.applicationRepo.updateArchiveStatus(applicationId, isArchived);
  }

  async updateStarredStatus(
    applicationId: string,
    companyId: string,
    isStarred: boolean,
  ): Promise<void> {
    const isOwner = await this.applicationRepo.isEmployerOwner(
      applicationId,
      companyId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to modify this application.',
      );
    }
    await this.applicationRepo.updateStarredStatus(applicationId, isStarred);
  }

  async getJobApplicationStats(
    jobId: string,
    companyId: string,
  ): Promise<JobApplicationStatsDto> {
    const isOwner = await this.jobsService.checkJobOwnership(jobId, companyId);
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to view stats for this job.',
      );
    }
    return this.applicationRepo.getStatsByJobId(jobId);
  }

  async getApplicationsForJob(
    jobId: string,
    companyId: string,
    options: GetJobApplicationsQueryDto,
  ): Promise<PaginatedResult<EmployerApplicationResponseDto>> {
    const isOwner = await this.jobsService.checkJobOwnership(jobId, companyId);
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to view applications for this job.',
      );
    }

    const paginatedResult = await this.applicationRepo.findByJobId(
      jobId,
      options,
    );

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((app) => this.mapToEmployerResponse(app)),
    };
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
        throw new Error(`Unknown application status`);
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

  /**
   * Maps JobApplication entity to EmployerApplicationResponseDto,
   * returning  flattened fields
   */
  private mapToEmployerResponse(
    app: JobApplication,
  ): EmployerApplicationResponseDto {
    return {
      id: app.id,
      jobId: app.jobId,
      workerProfileId: app.workerProfileId,
      status: app.status,
      coverLetter: app.coverLetter,
      isArchived: app.isArchived ?? false,
      isStarred: app.isStarred ?? false,
      workerTitle: app.workerTitle,
      applicantName: app.applicantName,
      applicantEmail: app.applicantEmail,
      applicantAvatar: app.applicantAvatar ?? null,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
