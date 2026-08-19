import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyOrmEntity } from './infrastructure/company.orm-entity';
import { COMPANY_REPOSITORY } from './domain/company.repo.interface';
import { CompanyTypeormRepository } from './infrastructure/company.typeorm.repository';

import { StorageModule } from '@/integrations/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyOrmEntity]), StorageModule],
  controllers: [CompaniesController],
  providers: [
    {
      provide: COMPANY_REPOSITORY,
      useClass: CompanyTypeormRepository,
    },
    CompaniesService,
  ],
  exports: [COMPANY_REPOSITORY, CompaniesService],
})
export class CompaniesModule {}
