import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  type ICompanyRepository,
  COMPANY_REPOSITORY,
  CreateCompanyParams,
} from './domain/company.repo.interface';
import { Company } from './domain/company.entity';
import { EntityManager } from 'typeorm';
import { STORAGE_SERVICE } from '@/integrations/storage/storage.interface';
import type { IStorageService } from '@/integrations/storage/storage.interface';

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

    const updated = await this.companyRepository.update(companyId, {
      logoUrl: result.url,
      logoPublicId: result.publicId,
    });
    return updated!;
  }

  async removeLogo(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.logoPublicId) {
      await this.storageService.deleteFile(company.logoPublicId);
    }

    const updated = await this.companyRepository.update(companyId, {
      logoUrl: null,
      logoPublicId: null,
    });
    return updated!;
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

    const updated = await this.companyRepository.update(companyId, {
      coverUrl: result.url,
      coverPublicId: result.publicId,
    });
    return updated!;
  }

  async removeCover(companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.coverPublicId) {
      await this.storageService.deleteFile(company.coverPublicId);
    }

    const updated = await this.companyRepository.update(companyId, {
      coverUrl: null,
      coverPublicId: null,
    });
    return updated!;
  }
}
