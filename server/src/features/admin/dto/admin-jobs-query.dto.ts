import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';
import { JobType } from '@/features/jobs/domain/job-type.enum';
import { ExperienceLevel } from '@/features/jobs/domain/exp-level.enum';

export class AdminJobsQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: 'Search term for job title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: JobStatus, description: 'Filter by job status' })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Filter by specific company ID' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ enum: JobType, description: 'Filter by job type' })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({
    enum: ExperienceLevel,
    description: 'Filter by experience level',
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;
}
