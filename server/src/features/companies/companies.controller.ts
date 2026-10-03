import {
  Controller,
  UseGuards,
  Get,
  Patch,
  Body,
  ForbiddenException,
  Delete,
  UploadedFile,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { ApiImageUpload } from '@/common/decorators/api-image-upload.decorator';
import { ImageValidationPipe } from '@/common/pipes/image-validation.pipe';
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
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Returns company details',
  })
  async getMyCompany(@CurrentUser('companyId') companyId: string) {
    if (!companyId) {
      throw new ForbiddenException('You are not associated with any company.');
    }
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
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Update my company details (Admin)' })
  @ApiStandardResponse(Company)
  @ApiResponse({ status: 200, description: 'Company updated' })
  async updateCompanyProfile(
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

  @Patch('me/logo')
  @Roles(UserType.EMPLOYER)
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
    @CurrentUser('role') role: CompanyRole,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    if (!companyId)
      throw new ForbiddenException('You are not associated with any company.');
    if (role !== CompanyRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions.');
    }
    return this.companiesService.uploadLogo(companyId, file);
  }

  @Delete('me/logo')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Remove company logo (Admin)' })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Company logo removed',
  })
  async removeLogo(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
  ) {
    if (!companyId)
      throw new ForbiddenException('You are not associated with any company.');
    if (role !== CompanyRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions.');
    }
    return this.companiesService.removeLogo(companyId);
  }

  @Patch('me/cover')
  @Roles(UserType.EMPLOYER)
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
    @CurrentUser('role') role: CompanyRole,
    @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  ) {
    if (!companyId)
      throw new ForbiddenException('You are not associated with any company.');
    if (role !== CompanyRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions.');
    }
    return this.companiesService.uploadCover(companyId, file);
  }

  @Delete('me/cover')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Remove company cover (Admin)' })
  @ApiStandardResponse(Company)
  @ApiResponse({
    status: 200,
    description: 'Company cover removed',
  })
  async removeCover(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
  ) {
    if (!companyId)
      throw new ForbiddenException('You are not associated with any company.');
    if (role !== CompanyRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions.');
    }
    return this.companiesService.removeCover(companyId);
  }
}
