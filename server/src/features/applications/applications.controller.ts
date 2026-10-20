import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { ApplicationsService } from './applications.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateJobApplicationDto } from './dto/apply-to-job.dto';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import {
  UpdateApplicationStatusDto,
  UpdateApplicationArchiveDto,
  UpdateApplicationStarDto,
} from './dto/update-application.dto';
import { GetJobApplicationsQueryDto } from './dto/get-job-applications-query.dto';
import { JobApplicationStatsDto } from './dto/job-application-stats.dto';
import { JobApplication } from './domain/job-application.entity';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';
import { CandidateApplicationResponseDto } from './dto/candidate-application-response.dto';
import { EmployerApplicationResponseDto } from './dto/employer-application-response.dto';

@ApiTags('Job Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserType.CANDIDATE)
  @ApiOperation({ summary: 'Submit an application for a job (Worker only)' })
  @ApiStandardResponse(JobApplication)
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Worker profile not found.' })
  @ApiResponse({
    status: 409,
    description: 'You have already applied to this job.',
  })
  async applyToJob(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateJobApplicationDto,
  ) {
    return this.applicationsService.applyToJob(userId, dto);
  }

  @Get('me')
  @Roles(UserType.CANDIDATE)
  @ApiOperation({
    summary: 'Get all my job applications with pagination (Worker only)',
  })
  @ApiPaginatedResponse(CandidateApplicationResponseDto)
  async getMyApplications(
    @CurrentUser('id') userId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.applicationsService.getMyApplications(userId, pageOptionsDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Update the status of a specific application (Employer only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Application status updated.',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, companyId, dto.status);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Archive or unarchive an application (Employer only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Application archive status updated.',
  })
  async updateArchiveStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateApplicationArchiveDto,
  ) {
    return this.applicationsService.updateArchiveStatus(
      id,
      companyId,
      dto.isArchived,
    );
  }

  @Patch(':id/star')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Star or unstar an application (Employer only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Application starred status updated.',
  })
  async updateStarredStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateApplicationStarDto,
  ) {
    return this.applicationsService.updateStarredStatus(
      id,
      companyId,
      dto.isStarred,
    );
  }

  @Get('job/:jobId/stats')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary:
      'Get application counts and aggregate analytics for a specific job (Employer only)',
  })
  @ApiStandardResponse(JobApplicationStatsDto)
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Employer must belong to a company to view applications.',
  })
  async getJobApplicationStats(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    if (!companyId) {
      throw new ForbiddenException(
        'You must belong to a company to view applications.',
      );
    }
    return this.applicationsService.getJobApplicationStats(jobId, companyId);
  }

  @Get('job/:jobId')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Get all applications for a specific job (Employer only)',
  })
  @ApiPaginatedResponse(EmployerApplicationResponseDto)
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Employer must belong to a company to view applications.',
  })
  async getApplicationsForJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser('companyId') companyId: string,
    @Query() queryDto: GetJobApplicationsQueryDto,
  ) {
    if (!companyId) {
      throw new ForbiddenException(
        'You must belong to a company to view applications.',
      );
    }
    return this.applicationsService.getApplicationsForJob(
      jobId,
      companyId,
      queryDto,
    );
  }
}
