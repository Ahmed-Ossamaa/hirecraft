import { Module } from '@nestjs/common';
import { CompanyMembersService } from './company-members.service';
import { CompanyMembersController } from './company-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyMemberOrmEntity } from './infrastructure/company-member.orm-entity';
import { COMPANY_MEMBER_REPOSITORY } from './domain/company-member.repo.interface';
import { CompanyMemberTypeormRepository } from './infrastructure/company-member.typeorm.repository';
import { MailModule } from '@/integrations/mail/mail.module';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyMemberOrmEntity]), MailModule, UsersModule, CompaniesModule],
  controllers: [CompanyMembersController],
  providers: [
    {
      provide: COMPANY_MEMBER_REPOSITORY,
      useClass: CompanyMemberTypeormRepository,
    },
    CompanyMembersService,
  ],
  exports: [COMPANY_MEMBER_REPOSITORY, CompanyMembersService],
})
export class CompanyMembersModule {}
