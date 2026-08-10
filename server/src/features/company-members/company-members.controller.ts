import { Controller } from '@nestjs/common';
import { CompanyMembersService } from './company-members.service';

@Controller('company-members')
export class CompanyMembersController {
  constructor(private readonly companyMembersService: CompanyMembersService) {}
}
