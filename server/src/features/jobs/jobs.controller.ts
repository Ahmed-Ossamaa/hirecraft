import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  UseGuards,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CompanyRole } from '../company-members/domain/company-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';
import { RolesGuard } from '@/common/guards/role.guard';
import { Job } from './domain/job.entity';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobWithStatsDto } from './dto/job-with-stats.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Create a new job posting for a company (always created as DRAFT)',
  })
  @ApiStandardResponse(Job)
  @ApiResponse({
    status: 201,
    description: 'Job draft created successfully.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Employer must belong to a company to post a job, or lacks permissions.',
  })
  async createJob(
    @Body() dto: CreateJobDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId?: string,
    @CurrentUser('role') role?: CompanyRole,
  ) {
    if (!companyId) {
      throw new ForbiddenException(
        'You must belong to a company to post a job.',
      );
    }

    if (role !== CompanyRole.ADMIN && role !== CompanyRole.HIRING_MANAGER) {
      throw new ForbiddenException(
        'You do not have permission to create job postings.',
      );
    }

    const job = await this.jobsService.createJob({
      ...dto,
      companyId,
      authorId: userId,
    });

    return job;
  }

  @Get()
  @ApiOperation({
    summary: 'Get all published jobs for all companies with filter',
  })
  @ApiPaginatedResponse(Job)
  async findAll(@Query() query: FindJobsQueryDto) {
    return this.jobsService.findAllPublishedJobs(query);
  }

  @Get('company')
  @ApiOperation({
    summary: 'Get all jobs for a specific company -My company- (paginated)',
  })
  @ApiPaginatedResponse(JobWithStatsDto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.EMPLOYER)
  async getCompanyJobs(
    @Query() query: FindJobsQueryDto,
    @CurrentUser('companyId') companyId?: string,
  ) {
    if (!companyId) {
      throw new ForbiddenException(
        'You must belong to a company to view its jobs.',
      );
    }

    // Returns ALL jobs (Drafts, Published, etc.) for this specific company
    return this.jobsService.getJobsByCompany(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific job' })
  @ApiStandardResponse(Job)
  @ApiResponse({ status: 200, description: 'Returns job details' })
  async getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.getJobById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Update job posting details (Employer only)' })
  @ApiStandardResponse(Job)
  @ApiResponse({
    status: 200,
    description: 'Job details updated successfully.',
  })
  async updateJob(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
  ) {
    if (!companyId) throw new ForbiddenException('No company association.');
    if (role !== CompanyRole.ADMIN && role !== CompanyRole.HIRING_MANAGER) {
      throw new ForbiddenException(
        'You do not have permission to update job postings.',
      );
    }
    return this.jobsService.updateJob(id, companyId, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Update job publication status (Employer only)',
    operationId: 'updateJobStatus',
  })
  @ApiStandardResponse(Job)
  @ApiResponse({
    status: 200,
    description: 'Job status updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. Employers cannot manually set CLOSED or lack permission.',
  })
  async updateJobStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobStatusDto,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
  ) {
    if (!companyId) throw new ForbiddenException('No company association.');
    if (role !== CompanyRole.ADMIN && role !== CompanyRole.HIRING_MANAGER) {
      throw new ForbiddenException(
        'You do not have permission to update job postings.',
      );
    }
    return this.jobsService.updateJobStatus(id, companyId, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Delete a job posting (Employer only)' })
  @ApiResponse({ status: 204, description: 'Job deleted successfully.' })
  async deleteJob(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('role') role: CompanyRole,
  ) {
    if (!companyId) throw new ForbiddenException('No company association.');
    if (role !== CompanyRole.ADMIN && role !== CompanyRole.HIRING_MANAGER) {
      throw new ForbiddenException(
        'You do not have permission to delete job postings.',
      );
    }
    await this.jobsService.deleteJob(id, companyId);
  }
}
