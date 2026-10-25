import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Body,
  Delete,
  UploadedFile,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';
import { ApiImageUpload } from '@/common/decorators/api-image-upload.decorator';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CompanyRoleGuard } from '@/common/guards/company-role.guard';
import { RequireCompanyRole } from '@/common/decorators/company-role.decorator';
import { CompanyRole } from '../company-members/domain/company-role.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { FindCompaniesQueryDto } from './dto/find-companies-query.dto';
import { CompanyListItemDto } from './dto/company-list-item.dto';
import { Company } from './domain/company.entity';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all companies paginated with filters (Public)',
  })
  @ApiPaginatedResponse(CompanyListItemDto)
  async findAllCompanies(@Query() query: FindCompaniesQueryDto) {
    return this.companiesService.findAllCompanies(query);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(
    CompanyRole.ADMIN,
    CompanyRole.HIRING_MANAGER,
    CompanyRole.STAFF,
  )
  @ApiOperation({ summary: 'Get details of my company' })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Returns company details',
  })
  async getMyCompany(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.getMyCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific company profile by its ID (Public)',
  })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Returns company details',
  })
  async getCompanyById(@Param('id') id: string) {
    return this.companiesService.getCompanyById(id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Update my company details (Admin)' })
  @ApiStandardResponse(Company)
  @ApiResponse({ status: 200, description: 'Company updated' })
  async updateCompanyProfile(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateCompany(companyId, dto);
  }

  @Patch('me/logo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiImageUpload('image')
  @ApiOperation({
    summary: 'Upload or update company logo (Admin)',
  })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Company logo updated',
  })
  async uploadLogo(
    @CurrentUser('companyId') companyId: string,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    return this.companiesService.uploadLogo(companyId, file);
  }

  @Delete('me/logo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Remove company logo (Admin)' })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Company logo removed',
  })
  async removeLogo(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.removeLogo(companyId);
  }

  @Patch('me/cover')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiImageUpload('image')
  @ApiOperation({
    summary: 'Upload or update company cover (Admin)',
  })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Company cover updated',
  })
  async uploadCover(
    @CurrentUser('companyId') companyId: string,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    return this.companiesService.uploadCover(companyId, file);
  }

  @Delete('me/cover')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Remove company cover (Admin)' })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Company cover removed',
  })
  async removeCover(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.removeCover(companyId);
  }
}
