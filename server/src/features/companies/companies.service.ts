import { Injectable, Inject } from '@nestjs/common';
import {
  type ICompanyRepository,
  COMPANY_REPOSITORY,
  CreateCompanyParams,
} from './domain/company.repo.interface';
import { Company } from './domain/company.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async createCompany(
    params: CreateCompanyParams,
    tx?: EntityManager,
  ): Promise<Company> {
    return this.companyRepository.create(params, tx);
  }
}
