import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IJobRepository,
  CreateJobParams,
  FindJobsFilters,
} from '../domain/job.repo.interface';
import { Job } from '../domain/job.entity';
import { JobOrmEntity } from './job.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class JobTypeormRepository implements IJobRepository {
  constructor(
    @InjectRepository(JobOrmEntity)
    private readonly repository: Repository<JobOrmEntity>,
  ) {}

  async create(params: CreateJobParams): Promise<Job> {
    const job = this.repository.create(params);
    const savedJob = await this.repository.save(job);
    return this.mapToDomain(savedJob);
  }

  async findAll(
    options: PageOptionsDto,
    filters?: FindJobsFilters,
  ): Promise<PaginatedResult<Job>> {
    const qb = this.repository.createQueryBuilder('job');

    if (filters?.search) {
      const search = `%${filters.search.trim()}%`;
      qb.andWhere(
        '(job.title ILIKE :search OR job.description ILIKE :search)',
        { search },
      );
    }
    if (filters?.status)
      qb.andWhere('job.status = :status', { status: filters.status });
    if (filters?.companyId)
      qb.andWhere('job.companyId = :companyId', {
        companyId: filters.companyId,
      });
    if (filters?.experienceLevel)
      qb.andWhere('job.experienceLevel = :experienceLevel', {
        experienceLevel: filters.experienceLevel,
      });
    if (filters?.jobType)
      qb.andWhere('job.jobType = :jobType', { jobType: filters.jobType });
    if (filters?.country)
      qb.andWhere('job.country = :country', { country: filters.country });
    if (filters?.city) qb.andWhere('job.city = :city', { city: filters.city });

    qb.leftJoin('job.company', 'company')
      .addSelect(['company.name', 'company.logoUrl'])
      .leftJoin('job.machine', 'machine')
      .addSelect(['machine.nameEn', 'machine.nameAr'])
      .skip(options.skip)
      .take(options.limit)
      .orderBy('job.createdAt', options.order);

    const [jobs, total] = await qb.getManyAndCount();

    return {
      data: jobs.map((job) => this.mapToDomain(job)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async findById(id: string): Promise<Job | null> {
    const job = await this.repository
      .createQueryBuilder('job')
      .where('job.id = :id', { id })
      .leftJoin('job.company', 'company')
      .addSelect(['company.name', 'company.logoUrl'])
      .leftJoin('job.machine', 'machine')
      .addSelect(['machine.nameEn', 'machine.nameAr'])
      .getOne();

    return job ? this.mapToDomain(job) : null;
  }

  async findByCompanyId(companyId: string): Promise<Job[]> {
    const jobs = await this.repository
      .createQueryBuilder('job')
      .where('job.companyId = :companyId', { companyId })
      .leftJoin('job.company', 'company')
      .addSelect(['company.name', 'company.logoUrl'])
      .leftJoin('job.machine', 'machine')
      .addSelect(['machine.nameEn', 'machine.nameAr'])
      .orderBy('job.createdAt', 'DESC')
      .getMany();

    return jobs.map((job) => this.mapToDomain(job));
  }

  async update(
    id: string,
    params: Partial<CreateJobParams>,
  ): Promise<Job | null> {
    await this.repository.update(id, params);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private mapToDomain(ormEntity: JobOrmEntity): Job {
    const job = new Job();
    Object.assign(job, ormEntity);

    if (ormEntity.company) {
      job.companyName = ormEntity.company.name;
      job.companyLogo = ormEntity.company.logoUrl ?? undefined;
    }

    if (ormEntity.machine) {
      job.machineNameEn = ormEntity.machine.nameEn;
      job.machineNameAr = ormEntity.machine.nameAr;
    }

    return job;
  }
}
