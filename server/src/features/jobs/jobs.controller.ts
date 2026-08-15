import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CompanyRole } from '../company-members/domain/company-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { FindJobsQueryDto } from './dto/find-jobs-query.dto';
import { RolesGuard } from '@/common/guards/role.guard';
import { Job } from './domain/job.entity';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.EMPLOYER)
  @ApiOperation({ summary: 'Create a new job posting for a company' })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully.',
    type: Job,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User lacks permissions.',
  })
  async createJob(
    @Body() dto: CreateJobDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('companyId') companyId?: string,
    @CurrentUser('role') role?: string,
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
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of jobs.',
  })
  async findAll(@Query() query: FindJobsQueryDto) {
    return this.jobsService.findAllPublishedJobs(query);
  }

  @Get('company')
  @ApiOperation({
    summary: 'Get all jobs for a specific company -My company- (paginated)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of company jobs.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.EMPLOYER)
  async getCompanyJobs(
    @Query() query: PageOptionsDto,
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
}
