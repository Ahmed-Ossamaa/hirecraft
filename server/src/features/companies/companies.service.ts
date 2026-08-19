import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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

  async getMyCompany(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async updateCompany(
    companyId: string,
    params: Partial<CreateCompanyParams>,
  ): Promise<Company> {
    const updated = await this.companyRepository.update(companyId, params);
    if (!updated) {
      throw new NotFoundException('Company not found');
    }
    return updated;
  }
}
