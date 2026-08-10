import { Injectable, Inject } from '@nestjs/common';
import {
  type ICompanyRepository,
  COMPANY_REPOSITORY,
  CreateCompanyParams,
} from './domain/company.repo.interface';
import { Company } from './domain/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async createCompany(params: CreateCompanyParams, tx?: any): Promise<Company> {
    return this.companyRepository.create(params, tx);
  }
}
