import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  ICompanyRepository,
  CreateCompanyParams,
} from '../domain/company.repo.interface';
import { Company } from '../domain/company.entity';
import { CompanyOrmEntity } from './company.orm-entity';

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

  async update(
    id: string,
    params: Partial<CreateCompanyParams>,
  ): Promise<Company | null> {
    await this.repository.update(id, params);
    return this.findById(id);
  }

  private mapToDomain(orm: CompanyOrmEntity): Company {
    const company = new Company();
    Object.assign(company, orm);
    return company;
  }
}
