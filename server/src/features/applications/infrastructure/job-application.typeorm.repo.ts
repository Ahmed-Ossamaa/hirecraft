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
    const application = await this.repository.findOne({
      where: { id },
      relations: {
        job: true,
        workerProfile: true,
      },
    });
    return application ? this.mapToDomain(application) : null;
  }

  async findByJobId(
    jobId: string,
    options: PageOptionsDto,
  ): Promise<PaginatedResult<JobApplication>> {
    const [applications, total] = await this.repository.findAndCount({
      where: { jobId },
      relations: { workerProfile: true },
      order: { createdAt: options.order },
      skip: options.skip,
      take: options.limit,
    });
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
    const [applications, total] = await this.repository.findAndCount({
      where: { workerProfileId },
      relations: { job: true },
      order: { createdAt: 'DESC' },
      skip: options.skip,
      take: options.limit,
    });
    return {
      data: applications.map((app) => this.mapToDomain(app)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<JobApplication | null> {
    await this.repository.update(id, { status });
    return this.findById(id);
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
  // ---  Mapper ---
  private mapToDomain(orm: JobApplicationOrmEntity): JobApplication {
    const application = new JobApplication();

    Object.assign(application, orm);

    application.jobTitle = orm.job?.title;
    application.workerTitle = orm.workerProfile?.title;

    return application;
  }
}
