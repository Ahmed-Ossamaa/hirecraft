import { Module } from '@nestjs/common';
import { CompanyMembersService } from './company-members.service';
import { CompanyMembersController } from './company-members.controller';
import { CompanyMemberRepositoryModule } from './company-member-repository.module';
import { MailModule } from '@/integrations/mail/mail.module';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { SubscriptionLimitsModule } from '../billing/subscription-limits/subscription-limits.module';

@Module({
  imports: [
    CompanyMemberRepositoryModule,
    MailModule,
    UsersModule,
    CompaniesModule,
    SubscriptionLimitsModule,
  ],
  controllers: [CompanyMembersController],
  providers: [CompanyMembersService],
  exports: [CompanyMembersService],
})
export class CompanyMembersModule {}
