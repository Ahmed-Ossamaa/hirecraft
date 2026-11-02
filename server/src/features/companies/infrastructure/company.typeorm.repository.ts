import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, IsNull } from 'typeorm';
import {
  ICompanyRepository,
  CreateCompanyParams,
  FindCompaniesOptions,
} from '../domain/company.repo.interface';
import { Company } from '../domain/company.entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class CompanyTypeormRepository implements ICompanyRepository {
  constructor(
    @InjectRepository(CompanyOrmEntity)
    private readonly repository: Repository<CompanyOrmEntity>,
  ) {}

  async create(
    params: CreateCompanyParams,
    tx?: EntityManager,
  ): Promise<Company> {
    const manager = tx || this.repository.manager;
    const company = manager.create(CompanyOrmEntity, params);
    const savedCompany = await manager.save(company);
    return this.mapToDomain(savedCompany);
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.repository.findOne({ where: { id } });
    return company ? this.mapToDomain(company) : null;
  }

  async findAll(
    options?: FindCompaniesOptions,
  ): Promise<PaginatedResult<Company>> {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;
    const order = options?.order || 'DESC';

    const qb = this.repository.createQueryBuilder('company');

    qb.select([
      'company.id',
      'company.name',
      'company.logoUrl',
      'company.coverUrl',
      'company.industry',
      'company.country',
      'company.city',
      'company.createdAt',
    ]);

    if (options?.search) {
      const search = `%${options.search.trim()}%`;
      qb.andWhere('company.name ILIKE :search', { search });
    }

    if (options?.industry) {
      qb.andWhere('company.industry = :industry', {
        industry: options.industry.trim(),
      });
    }

    if (options?.country) {
      qb.andWhere('company.country = :country', {
        country: options.country.trim(),
      });
    }

    if (options?.city) {
      qb.andWhere('company.city = :city', {
        city: options.city.trim(),
      });
    }

    qb.orderBy('company.createdAt', order);
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map((orm) => this.mapToDomain(orm)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(
    id: string,
    params: Partial<CreateCompanyParams>,
  ): Promise<void> {
    await this.repository.update(id, params);
  }

  async updatePaymentCustomerIdIfNull(
    companyId: string,
    customerId: string,
  ): Promise<boolean> {
    const updateResult = await this.repository.update(
      { id: companyId, paymentCustomerId: IsNull() },
      { paymentCustomerId: customerId },
    );
    return (updateResult.affected ?? 0) > 0;
  }

  /**
   * Acquires a pessimistic write lock on the company row.
   * This serializes concurrent publish/invite operations for the same company,
   * preventing race conditions when enforcing subscription limits.
   */
  async lockForWrite(companyId: string, tx: EntityManager): Promise<void> {
    await tx.findOne(CompanyOrmEntity, {
      where: { id: companyId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  private mapToDomain(orm: CompanyOrmEntity): Company {
    const company = new Company();
    Object.assign(company, orm);
    return company;
  }
}
