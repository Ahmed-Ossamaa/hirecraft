import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  JobApplicationRepositoryInterface,
  CreateJobApplicationParams,
} from '../domain/job-application.repo.interface';
import { JobApplication } from '../domain/job-application.entity';
import { JobApplicationOrmEntity } from './job-application.orm-entity';
import { ApplicationStatus } from '../domain/application-status.enum';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import {
  GetJobApplicationsQueryDto,
  ApplicationTab,
} from '../dto/get-job-applications-query.dto';
import { JobApplicationStatsDto } from '../dto/job-application-stats.dto';

@Injectable()
export class JobApplicationTypeormRepository implements JobApplicationRepositoryInterface {
  constructor(
    @InjectRepository(JobApplicationOrmEntity)
    private readonly repository: Repository<JobApplicationOrmEntity>,
  ) {}

  async create(params: CreateJobApplicationParams): Promise<JobApplication> {
    const apply = this.repository.create(params);
    const savedApplication = await this.repository.save(apply);

    const application = new JobApplication();
    Object.assign(application, savedApplication);
    return application;
  }

  async findById(id: string): Promise<JobApplication | null> {
    const application = await this.repository
      .createQueryBuilder('app')
      .where('app.id = :id', { id })
      .leftJoin('app.job', 'job')
      .addSelect(['job.title'])
      .leftJoin('app.workerProfile', 'wp')
      .addSelect(['wp.id', 'wp.title', 'wp.city', 'wp.country'])
      .leftJoin('wp.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.avatarURL',
      ])
      .getOne();
    return application ? this.mapToDomain(application) : null;
  }

  async findByJobId(
    jobId: string,
    options: GetJobApplicationsQueryDto,
  ): Promise<PaginatedResult<JobApplication>> {
    const qb = this.repository
      .createQueryBuilder('app')
      .where('app.jobId = :jobId', { jobId })
      .leftJoin('app.workerProfile', 'wp')
      .addSelect(['wp.id', 'wp.title', 'wp.city', 'wp.country'])
      .leftJoin('wp.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.avatarURL',
      ]);

    const tab = options.tab || ApplicationTab.ALL;
    if (tab === ApplicationTab.ARCHIVED) {
      qb.andWhere('app.isArchived = true');
    } else if (tab === ApplicationTab.STARRED) {
      qb.andWhere('app.isStarred = true');
    } else {
      qb.andWhere('app.isArchived = false');

      if (tab === ApplicationTab.PENDING) {
        qb.andWhere('app.status = :status', {
          status: ApplicationStatus.PENDING,
        });
      } else if (tab === ApplicationTab.SHORTLISTED) {
        qb.andWhere('app.status = :status', {
          status: ApplicationStatus.SHORTLISTED,
        });
      } else if (tab === ApplicationTab.SCHEDULED) {
        qb.andWhere('app.status = :status', {
          status: ApplicationStatus.INTERVIEW_SCHEDULED,
        });
      } else if (tab === ApplicationTab.OFFERED) {
        qb.andWhere('app.status IN (:...offered)', {
          offered: [
            ApplicationStatus.OFFERED,
            ApplicationStatus.OFFER_ACCEPTED,
            ApplicationStatus.OFFER_DECLINED,
          ],
        });
      } else if (tab === ApplicationTab.CLOSED) {
        qb.andWhere('app.status IN (:...closed)', {
          closed: [ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
        });
      }
    }

    if (options.search?.trim()) {
      const prefix = `${options.search.trim().toLowerCase()}%`;
      qb.andWhere(
        `LOWER(user.firstName || ' ' || user.lastName) LIKE :prefix`,
        { prefix },
      );
    }

    qb.orderBy('app.createdAt', options.order || 'DESC');
    qb.skip(options.skip).take(options.limit);

    const [applications, total] = await qb.getManyAndCount();

    return {
      data: applications.map((app) => this.mapToDomain(app)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async findByWorkerProfileId(
    workerProfileId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<JobApplication>> {
    const qb = this.repository
      .createQueryBuilder('app')
      .where('app.workerProfileId = :workerProfileId', { workerProfileId })
      .leftJoin('app.job', 'job')
      .addSelect(['job.title'])
      .leftJoin('job.company', 'company')
      .addSelect(['company.id', 'company.name'])
      .orderBy('app.createdAt', options.order || 'DESC')
      .skip(options.skip)
      .take(options.limit);

    const [applications, total] = await qb.getManyAndCount();
    return {
      data: applications.map((app) => this.mapToDomain(app)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<void> {
    await this.repository.update(id, { status });
  }

  async updateArchiveStatus(id: string, isArchived: boolean): Promise<void> {
    await this.repository.update(id, { isArchived });
  }

  async updateStarredStatus(id: string, isStarred: boolean): Promise<void> {
    await this.repository.update(id, { isStarred });
  }

  async getStatsByJobId(jobId: string): Promise<JobApplicationStatsDto> {
    const raw = await this.repository.manager
      .createQueryBuilder(JobApplicationOrmEntity, 'app')
      .select('COUNT(*)::int', 'total')
      .addSelect(
        `COUNT(*) FILTER (WHERE app."isArchived" = false AND app."status" = :pending)::int`,
        'pending',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE app."isArchived" = false AND app."status" IN (:...inProgress))::int`,
        'inProgress',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE app."isArchived" = false AND app."status" = :accepted)::int`,
        'offersAccepted',
      )
      .where('app."jobId" = :jobId', {
        jobId,
        pending: ApplicationStatus.PENDING,
        inProgress: [
          ApplicationStatus.SHORTLISTED,
          ApplicationStatus.INTERVIEW_SCHEDULED,
          ApplicationStatus.OFFERED,
        ],
        accepted: ApplicationStatus.OFFER_ACCEPTED,
      })
      .getRawOne<{
        total: number;
        pending: number;
        inProgress: number;
        offersAccepted: number;
      }>();

    return {
      total: Number(raw?.total || 0),
      pending: Number(raw?.pending || 0),
      inProgress: Number(raw?.inProgress || 0),
      offersAccepted: Number(raw?.offersAccepted || 0),
    };
  }

  async exists(jobId: string, workerProfileId: string): Promise<boolean> {
    const isExist = await this.repository.exists({
      where: { jobId, workerProfileId },
    });

    return isExist;
  }

  async isEmployerOwner(
    applicationId: string,
    companyId: string,
  ): Promise<boolean> {
    return await this.repository.exists({
      where: {
        id: applicationId,
        job: {
          companyId: companyId,
        },
      },
    });
  }

  async getCountsByJobIds(jobIds: string[]): Promise<Map<string, number>> {
    if (jobIds.length === 0) return new Map();

    const counts = await this.repository.manager
      .createQueryBuilder(JobApplicationOrmEntity, 'app')
      .select('app.jobId', 'jobId')
      .addSelect('COUNT(app.id)', 'count')
      .where('app.jobId IN (:...jobIds)', { jobIds })
      .groupBy('app.jobId')
      .getRawMany<{ jobId: string; count: string }>();

    return new Map(counts.map((c) => [c.jobId, Number(c.count)]));
  }

  // ---  Mapper ---
  private mapToDomain(orm: JobApplicationOrmEntity): JobApplication {
    const application = new JobApplication();

    application.id = orm.id;
    application.jobId = orm.jobId;
    application.workerProfileId = orm.workerProfileId;
    application.status = orm.status;
    application.coverLetter = orm.coverLetter;
    application.isArchived = orm.isArchived ?? false;
    application.isStarred = orm.isStarred ?? false;
    application.createdAt = orm.createdAt;
    application.updatedAt = orm.updatedAt;

    application.jobTitle = orm.job?.title;
    application.workerTitle = orm.workerProfile?.title;

    if (orm.job?.company) {
      application.companyId = orm.job.company.id;
      application.companyName = orm.job.company.name;
    }

    if (orm.workerProfile?.user) {
      application.applicantName =
        `${orm.workerProfile.user.firstName} ${orm.workerProfile.user.lastName}`.trim();
      application.applicantEmail = orm.workerProfile.user.email;
      application.applicantAvatar = orm.workerProfile.user.avatarURL ?? null;
    }

    return application;
  }
}
