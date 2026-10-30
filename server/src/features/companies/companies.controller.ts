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
import { CompanyResponseDto } from './dto/company-response.dto';

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
  @ApiStandardResponse(CompanyResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns company details',
  })
  async getMyCompany(@CurrentUser('companyId') companyId: string) {
    const company = await this.companiesService.getMyCompany(companyId);
    return CompanyResponseDto.fromDomain(company);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific company profile by its ID (Public)',
  })
  @ApiStandardResponse(CompanyResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Returns company details',
  })
  async getCompanyById(@Param('id') id: string) {
    const company = await this.companiesService.getCompanyById(id);
    return CompanyResponseDto.fromDomain(company);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Update my company details (Admin)' })
  @ApiStandardResponse(CompanyResponseDto)
  @ApiResponse({ status: 200, description: 'Company updated' })
  async updateCompanyProfile(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    const company = await this.companiesService.updateCompany(companyId, dto);
    return CompanyResponseDto.fromDomain(company);
  }

  @Patch('me/logo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiImageUpload('image')
  @ApiOperation({
    summary: 'Upload or update company logo (Admin)',
  })
  @ApiStandardResponse(CompanyResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Company logo updated',
  })
  async uploadLogo(
    @CurrentUser('companyId') companyId: string,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    const company = await this.companiesService.uploadLogo(companyId, file);
    return CompanyResponseDto.fromDomain(company);
  }

  @Delete('me/logo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Remove company logo (Admin)' })
  @ApiStandardResponse(CompanyResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Company logo removed',
  })
  async removeLogo(@CurrentUser('companyId') companyId: string) {
    const company = await this.companiesService.removeLogo(companyId);
    return CompanyResponseDto.fromDomain(company);
  }

  @Patch('me/cover')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiImageUpload('image')
  @ApiOperation({
    summary: 'Upload or update company cover (Admin)',
  })
  @ApiStandardResponse(CompanyResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Company cover updated',
  })
  async uploadCover(
    @CurrentUser('companyId') companyId: string,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    const company = await this.companiesService.uploadCover(companyId, file);
    return CompanyResponseDto.fromDomain(company);
  }

  @Delete('me/cover')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CompanyRoleGuard)
  @RequireCompanyRole(CompanyRole.ADMIN)
  @ApiOperation({ summary: 'Remove company cover (Admin)' })
  @ApiStandardResponse(CompanyResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Company cover removed',
  })
  async removeCover(@CurrentUser('companyId') companyId: string) {
    const company = await this.companiesService.removeCover(companyId);
    return CompanyResponseDto.fromDomain(company);
  }
}
