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
import { JobApplicationOrmEntity } from '../../applications/infrastructure/job-application.orm-entity';

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
    if (filters?.status) {
      if (filters.status === JobStatus.PUBLISHED) {
        qb.andWhere('job.status = :status AND job.expiresAt > :now', {
          status: filters.status,
          now: new Date(),
        });
      } else {
        qb.andWhere('job.status = :status', { status: filters.status });
      }
    }
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

    let sortColumn = 'job.createdAt';
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'companyId':
          sortColumn = 'job.companyId';
          break;
        case 'publishedAt':
          sortColumn = 'job.publishedAt';
          break;
        case 'status':
          sortColumn = 'job.status';
          break;
        case 'date':
          sortColumn = 'job.createdAt';
          break;
        case 'applicants':
          sortColumn = 'appCount';
          qb.addSelect((subQuery) => {
            return subQuery
              .select('COUNT(app.id)', 'appCount')
              .from(JobApplicationOrmEntity, 'app')
              .where('app.jobId = job.id');
          }, 'appCount');
          break;
      }
    }

    qb.skip(options.skip)
      .take(options.limit)
      .orderBy(
        sortColumn,
        options.order,
        options.sortBy === 'publishedAt' ? 'NULLS LAST' : undefined,
      );

    const [jobs, total] = await qb.getManyAndCount();

    return {
      data: jobs.map((job) => this.mapToDomain(job)),
      total,
      page: options.page!,
      limit: options.limit!,
      totalPages: Math.ceil(total / options.limit!),
    };
  }

  async findById(id: string, tx?: EntityManager): Promise<Job | null> {
    const manager = tx || this.repository.manager;
    const job = await manager
      .createQueryBuilder(JobOrmEntity, 'job')
      .where('job.id = :id', { id })
      .leftJoin('job.company', 'company')
      .addSelect(['company.name', 'company.logoUrl'])
      .leftJoin('job.machine', 'machine')
      .addSelect(['machine.nameEn', 'machine.nameAr'])
      .getOne();

    return job ? this.mapToDomain(job) : null;
  }

  async exists(id: string, companyId?: string): Promise<boolean> {
    const where: { id: string; companyId?: string } = { id };
    if (companyId) where.companyId = companyId;
    return this.repository.exists({ where });
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

  async countPublishedActiveByCompanyId(
    companyId: string,
    tx?: EntityManager,
  ): Promise<number> {
    const manager = tx || this.repository.manager;
    const qb = manager.createQueryBuilder(JobOrmEntity, 'job');
    return qb
      .where('job.companyId = :companyId', { companyId })
      .andWhere('job.status = :status', { status: JobStatus.PUBLISHED })
      .andWhere('job.expiresAt > :now', { now: new Date() })
      .getCount();
  }

  /**
   * Batch counts total jobs for multiple companies in a single query.
   */
  async countJobsByCompanyIds(
    companyIds: string[],
    jobStatus?: JobStatus,
    tx?: EntityManager,
  ): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (!companyIds || companyIds.length === 0) {
      return map;
    }

    const manager = tx || this.repository.manager;
    const qb = manager
      .createQueryBuilder(JobOrmEntity, 'job')
      .where('job.companyId IN (:...companyIds)', { companyIds });

    if (jobStatus) {
      qb.andWhere('job.status = :jobStatus', { jobStatus });
    }

    const rawResults = await qb
      .select(['job.companyId AS "companyId"', 'COUNT(job.id) AS "count"'])
      .groupBy('job.companyId')
      .getRawMany<{ companyId: string; count: string }>();

    for (const row of rawResults) {
      map.set(row.companyId, parseInt(row.count, 10));
    }

    return map;
  }

  async update(id: string, params: Partial<CreateJobParams>): Promise<void> {
    await this.repository.update(id, params);
  }

  async updateReturning(
    id: string,
    params: Partial<CreateJobParams>,
    companyId?: string,
    tx?: EntityManager,
  ): Promise<Job | null> {
    const manager = tx || this.repository.manager;
    const qb = manager
      .createQueryBuilder()
      .update(JobOrmEntity)
      .set(params)
      .where('id = :id', { id });

    if (companyId) {
      qb.andWhere('companyId = :companyId', { companyId });
    }

    const result = await qb.returning('*').execute();

    const rawRows = result.raw as Record<string, any>[];
    if (!rawRows || !rawRows[0]) return null;
    return this.mapToDomain(rawRows[0] as JobOrmEntity);
  }

  async closeExpiredJobs(now: Date, tx?: EntityManager): Promise<number> {
    const manager = tx || this.repository.manager;
    const result = await manager
      .createQueryBuilder()
      .update(JobOrmEntity)
      .set({ status: JobStatus.CLOSED })
      .where('status = :status', { status: JobStatus.PUBLISHED })
      .andWhere('expiresAt <= :now', { now })
      .execute();

    return result.affected ?? 0;
  }

  async closeExcessActiveJobs(
    companyId: string,
    keepCount: number,
    tx: EntityManager,
  ): Promise<number> {
    const activeJobs = await tx
      .createQueryBuilder(JobOrmEntity, 'job')
      .where('job.companyId = :companyId', { companyId })
      .andWhere('job.status = :status', { status: JobStatus.PUBLISHED })
      .andWhere('job.expiresAt > :now', { now: new Date() })
      .orderBy('job.publishedAt', 'DESC')
      .addOrderBy('job.createdAt', 'DESC')
      .addOrderBy('job.id', 'DESC')
      .getMany();

    if (activeJobs.length <= keepCount) {
      return 0;
    }

    const jobsToClose = activeJobs.slice(keepCount);
    const idsToClose = jobsToClose.map((j) => j.id);

    const result = await tx
      .createQueryBuilder()
      .update(JobOrmEntity)
      .set({ status: JobStatus.CLOSED })
      .whereInIds(idsToClose)
      .execute();

    return result.affected ?? 0;
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
