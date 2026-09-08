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
import { Company } from '@/features/companies/domain/company.entity';
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
  @ApiPaginatedResponse(Company)
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getCompanies(@Query() query: AdminCompaniesQueryDto) {
    return this.adminService.getCompanies(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get details of a specific company by ID (Admin only)',
  })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Returns company details.',
  })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getCompanyById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getCompanyById(id);
  }
}
