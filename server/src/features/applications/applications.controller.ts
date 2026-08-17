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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '../users/domain/user-type.enum';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateJobApplicationDto } from './dto/apply-to-job.dto';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JobApplication } from './domain/job-application.entity';

@ApiTags('Job Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserType.CANDIDATE)
  @ApiOperation({ summary: 'Submit an application for a job (Worker only)' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
    type: JobApplication,
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
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of applications.',
  })
  async getMyApplications(
    @CurrentUser('id') userId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.applicationsService.getMyApplications(userId, pageOptionsDto);
  }

  @Patch(':id/status')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Update the status of a specific application (Employer only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Application status updated.',
    type: JobApplication,
  })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, companyId, dto.status);
  }

  @Get('job/:jobId')
  @Roles(UserType.EMPLOYER)
  @ApiOperation({
    summary: 'Get all applications for a specific job (Employer only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of applications for the job.',
  })
  async getApplicationsForJob(
    @Param('jobId') jobId: string,
    @CurrentUser('companyId') companyId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    if (!companyId) {
      throw new ForbiddenException('You must belong to a company to view applications.');
    }
    return this.applicationsService.getApplicationsForJob(jobId, companyId, pageOptionsDto);
  }
}
