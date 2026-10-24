import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../domain/job-status.enum';

export class UpdateJobStatusDto {
  @ApiProperty({
    enum: [JobStatus.DRAFT, JobStatus.PUBLISHED],
    example: JobStatus.PUBLISHED,
    description: 'New status for the job posting (DRAFT or PUBLISHED)',
  })
  @IsEnum(JobStatus)
  status!: JobStatus;
}
