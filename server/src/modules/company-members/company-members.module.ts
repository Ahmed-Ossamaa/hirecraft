import { Module } from '@nestjs/common';
import { CompanyMembersService } from './company-members.service';
import { CompanyMembersController } from './company-members.controller';

@Module({
  controllers: [CompanyMembersController],
  providers: [CompanyMembersService],
})
export class CompanyMembersModule {}
