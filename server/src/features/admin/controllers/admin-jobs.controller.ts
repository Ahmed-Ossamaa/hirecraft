import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/role.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserType } from '@/features/users/domain/user-type.enum';
import { Job } from '@/features/jobs/domain/job.entity';
import { AdminService } from '../services/admin.service';
import { AdminJobsQueryDto } from '../dto/admin-jobs-query.dto';
import { UpdateJobStatusDto } from '../dto/update-job-status.dto';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';

@ApiTags('Admin Jobs')
@ApiBearerAuth()
@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PLATFORM_ADMIN)
export class AdminJobsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of all jobs across platform (Admin only)',
  })
  @ApiPaginatedResponse(Job)
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getJobs(@Query() query: AdminJobsQueryDto) {
    return this.adminService.getJobs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific job by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns job details.',
    type: Job,
  })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getJobById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update job status (e.g. PUBLISHED, DRAFT, CLOSED) (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status updated successfully.',
    type: Job,
  })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async updateJobStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateJobStatusDto,
  ) {
    return this.adminService.updateJobStatus(id, body.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a job posting (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Job deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Requires PLATFORM_ADMIN role.',
  })
  async deleteJob(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteJob(id);
  }
}
