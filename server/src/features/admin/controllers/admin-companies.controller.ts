import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/features/users/domain/user-type.enum';
import { AdminCompanyResponseDto } from '../dto/admin-company-response.dto';
import { CompanyMemberResponseDto } from '@/features/company-members/dto/company-member-response.dto';
import { GetCompanyMembersDto } from '@/features/company-members/dto/get-company-members.dto';
import { AdminService } from '../services/admin.service';
import { AdminCompaniesQueryDto } from '../dto/admin-companies-query.dto';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';

@ApiTags('Admin Companies')
@ApiBearerAuth()
@Controller('admin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PLATFORM_ADMIN)
export class AdminCompaniesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of companies with filters (Admin only)',
  })
  @ApiPaginatedResponse(AdminCompanyResponseDto)
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getCompanies(@Query() query: AdminCompaniesQueryDto) {
    const result = await this.adminService.getCompanies(query);
    return {
      ...result,
      data: result.data.map((company) =>
        AdminCompanyResponseDto.fromDomain(company, {
          memberCount: company.memberCount,
          jobCount: company.jobCount,
          subscriptionPlan: company.subscriptionPlan,
        }),
      ),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get details of a specific company by ID (Admin only)',
  })
  @ApiStandardResponse(AdminCompanyResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns company details.',
  })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async adminGetCompanyById(@Param('id', ParseUUIDPipe) id: string) {
    const { company, memberCount, jobCount } =
      await this.adminService.getCompanyById(id);
    return AdminCompanyResponseDto.fromDomain(company, {
      memberCount,
      jobCount,
      subscriptionPlan: company.subscriptionPlan,
    });
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'Get paginated list of members for a company (Admin only)',
  })
  @ApiPaginatedResponse(CompanyMemberResponseDto)
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getCompanyMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetCompanyMembersDto,
  ) {
    const result = await this.adminService.getCompanyMembers(id, query);
    return {
      ...result,
      data: result.data.map((m) => CompanyMemberResponseDto.fromDomain(m)),
    };
  }
}
