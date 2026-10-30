import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyMemberOrmEntity } from './infrastructure/company-member.orm-entity';
import { COMPANY_MEMBER_REPOSITORY } from './domain/company-member.repo.interface';
import { CompanyMemberTypeormRepository } from './infrastructure/company-member.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyMemberOrmEntity])],
  providers: [
    {
      provide: COMPANY_MEMBER_REPOSITORY,
      useClass: CompanyMemberTypeormRepository,
    },
  ],
  exports: [COMPANY_MEMBER_REPOSITORY, TypeOrmModule],
})
export class CompanyMemberRepositoryModule {}
