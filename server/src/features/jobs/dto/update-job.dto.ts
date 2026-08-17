import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../domain/job-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;
}
