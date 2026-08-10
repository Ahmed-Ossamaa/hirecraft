import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(params: CreateCompanyParams): Promise<Company> {
    const ormEntity = this.repository.create(params);
    const savedEntity = await this.repository.save(ormEntity);
    return this.mapToDomain(savedEntity);
  }

  private mapToDomain(orm: CompanyOrmEntity): Company {
    const company = new Company();
    Object.assign(company, orm);
    return company;
  }
}
