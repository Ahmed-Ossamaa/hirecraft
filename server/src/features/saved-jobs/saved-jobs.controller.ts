import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiStandardResponse } from '@/common/swagger/api-standard-response.decorator';
import { ApiPaginatedResponse } from '@/common/swagger/api-paginated-response.decorator';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJobResponseDto } from './dto/saved-job-response.dto';

@ApiTags('Saved Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/saved-jobs')
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Post(':jobId')
  @ApiOperation({ summary: 'Save a job for later' })
  @ApiStandardResponse(SavedJobResponseDto)
  @ApiResponse({ status: 201, description: 'Job saved successfully.' })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  @ApiResponse({ status: 409, description: 'Job is already saved.' })
  async saveJob(
    @CurrentUser('id') userId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<SavedJobResponseDto> {
    return this.savedJobsService.saveJob(userId, jobId);
  }

  @Delete(':jobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a saved job' })
  @ApiResponse({ status: 204, description: 'Saved job removed successfully.' })
  @ApiResponse({ status: 404, description: 'Saved job not found.' })
  async unsaveJob(
    @CurrentUser('id') userId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ): Promise<void> {
    await this.savedJobsService.unsaveJob(userId, jobId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all saved jobs for current user with pagination',
  })
  @ApiPaginatedResponse(SavedJobResponseDto)
  async getSavedJobs(
    @CurrentUser('id') userId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PaginatedResult<SavedJobResponseDto>> {
    return this.savedJobsService.getSavedJobs(userId, pageOptionsDto);
  }
}
