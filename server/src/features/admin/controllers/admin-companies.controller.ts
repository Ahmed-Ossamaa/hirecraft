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
import { CompanyResponseDto } from '@/features/companies/dto/company-response.dto';
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
  @ApiPaginatedResponse(CompanyResponseDto)
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getCompanies(@Query() query: AdminCompaniesQueryDto) {
    const result = await this.adminService.getCompanies(query);
    return {
      ...result,
      data: result.data.map((company) =>
        CompanyResponseDto.fromDomain(company),
      ),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get details of a specific company by ID (Admin only)',
  })
  @ApiStandardResponse(CompanyResponseDto)
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
    const company = await this.adminService.getCompanyById(id);
    return CompanyResponseDto.fromDomain(company);
  }
}
