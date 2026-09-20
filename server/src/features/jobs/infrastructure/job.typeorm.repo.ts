import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import {
  IJobRepository,
  CreateJobParams,
  FindJobsFilters,
} from '../domain/job.repo.interface';
import { Job } from '../domain/job.entity';
import { JobStatus } from '../domain/job-status.enum';
import { JobOrmEntity } from './job.orm-entity';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class JobTypeormRepository implements IJobRepository {
  constructor(
    @InjectRepository(JobOrmEntity)
    private readonly repository: Repository<JobOrmEntity>,
  ) {}

  async create(params: CreateJobParams, tx?: EntityManager): Promise<Job> {
    const manager = tx || this.repository.manager;
    const job = manager.create(JobOrmEntity, params);
    const savedJob = await manager.save(job);
    return this.mapToDomain(savedJob);
  }

  async findAll(
    options: PageOptionsDto,
    filters?: FindJobsFilters,
  ): Promise<PaginatedResult<Job>> {
    const qb = this.repository.createQueryBuilder('job');

    qb.leftJoin('job.company', 'company')
      .addSelect(['company.name', 'company.logoUrl'])
      .leftJoin('job.machine', 'machine')
      .addSelect(['machine.nameEn', 'machine.nameAr']);

    if (filters?.search) {
      const search = `%${filters.search.trim()}%`;
      qb.andWhere(
        '(job.title ILIKE :search OR machine.nameEn ILIKE :search OR machine.nameAr ILIKE :search)',
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
    if (filters?.yearsOfExperience !== undefined)
      qb.andWhere('job.yearsOfExperience >= :yearsOfExperience', {
        yearsOfExperience: filters.yearsOfExperience,
      });
    if (filters?.jobType)
      qb.andWhere('job.jobType = :jobType', { jobType: filters.jobType });
    if (filters?.country)
      qb.andWhere('TRIM(job.country) = :country', {
        country: filters.country.trim(),
      });
    if (filters?.city)
      qb.andWhere('TRIM(job.city) = :city', { city: filters.city.trim() });

    qb.skip(options.skip)
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

  async countActiveByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number> {
    const manager = tx || this.repository.manager;
    return manager.count(JobOrmEntity, {
      where: {
        companyId,
        status: JobStatus.PUBLISHED,
      },
    });
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { company, machine, author, category, ...columns } = ormEntity;
    const job = new Job();
    Object.assign(job, columns);

    if (company) {
      job.companyName = company.name;
      job.companyLogo = company.logoUrl ?? undefined;
    }

    if (machine) {
      job.machineNameEn = machine.nameEn;
      job.machineNameAr = machine.nameAr;
    }

    return job;
  }
}
