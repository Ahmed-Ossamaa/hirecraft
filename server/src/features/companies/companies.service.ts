import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  type ICompanyRepository,
  COMPANY_REPOSITORY,
  CreateCompanyParams,
  FindCompaniesOptions,
} from './domain/company.repo.interface';
import { Company } from './domain/company.entity';
import { EntityManager } from 'typeorm';
import { STORAGE_SERVICE } from '@/integrations/storage/storage.interface';
import type { IStorageService } from '@/integrations/storage/storage.interface';
import { PaginatedResult } from '@/common/pagination/paginated-results';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: ICompanyRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async createCompany(
    params: CreateCompanyParams,
    tx?: EntityManager,
  ): Promise<Company> {
    return this.companyRepository.create(params, tx);
  }

  async getCompanyById(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async getMyCompany(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findByIdWithMembers(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async findAllCompanies(
    options?: FindCompaniesOptions,
  ): Promise<PaginatedResult<Company>> {
    return this.companyRepository.findAll(options);
  }

  async updateCompany(
    companyId: string,
    params: Partial<CreateCompanyParams>,
  ): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.companyRepository.update(companyId, params);

    // Merge changes in memory instead of re-fetching
    Object.assign(company, params);

    return company;
  }

  async uploadLogo(
    companyId: string,
    file: Express.Multer.File,
  ): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const publicId = `company_${companyId}_logo`;
    const result = await this.storageService.uploadImage(file, {
      folder: 'companies/logos',
      type: 'company_logo',
      publicId,
      overwrite: true,
    });

    await this.companyRepository.update(companyId, {
      logoUrl: result.url,
      logoPublicId: result.publicId,
    });

    company.logoUrl = result.url;
    company.logoPublicId = result.publicId;

    return company;
  }

  async removeLogo(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.logoPublicId) {
      await this.storageService.deleteFile(company.logoPublicId);
    }

    await this.companyRepository.update(companyId, {
      logoUrl: null,
      logoPublicId: null,
    });

    company.logoUrl = null;
    company.logoPublicId = null;

    return company;
  }

  async uploadCover(
    companyId: string,
    file: Express.Multer.File,
  ): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const publicId = `company_${companyId}_cover`;
    const result = await this.storageService.uploadImage(file, {
      folder: 'companies/covers',
      type: 'company_cover',
      publicId,
      overwrite: true,
    });

    await this.companyRepository.update(companyId, {
      coverUrl: result.url,
      coverPublicId: result.publicId,
    });

    company.coverUrl = result.url;
    company.coverPublicId = result.publicId;

    return company;
  }

  async removeCover(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.coverPublicId) {
      await this.storageService.deleteFile(company.coverPublicId);
    }

    await this.companyRepository.update(companyId, {
      coverUrl: null,
      coverPublicId: null,
    });

    company.coverUrl = null;
    company.coverPublicId = null;

    return company;
  }

  async updatePaymentCustomerIdIfNull(
    companyId: string,
    customerId: string,
  ): Promise<boolean> {
    return this.companyRepository.updatePaymentCustomerIdIfNull(
      companyId,
      customerId,
    );
  }
}
