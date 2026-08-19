import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CompanyRole } from '../company-members/domain/company-role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './domain/company.entity';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('me')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Get details of my company' })
  @ApiResponse({
    status: 200,
    description: 'Returns company details',
    type: Company,
  })
  async getMyCompany(@CurrentUser('companyId') companyId: string) {
    if (!companyId) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    return this.companiesService.getMyCompany(companyId);
  }

  @Patch('me')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Update my company details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Company updated', type: Company })
  async updateMyCompany(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
    @Body() dto: UpdateCompanyDto,
  ) {
    if (!companyId) {
      throw new ForbiddenException('You are not associated with any company.');
    }
    if (role !== CompanyRole.ADMIN) {
      throw new ForbiddenException(
        'Only company administrators can update company details.',
      );
    }
    return this.companiesService.updateCompany(companyId, dto);
  }
}
