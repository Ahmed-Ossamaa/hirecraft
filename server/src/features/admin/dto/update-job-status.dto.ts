import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';

export class UpdateJobStatusDto {
  @ApiProperty({
    enum: JobStatus,
    description: 'New status for the job posting',
  })
  @IsEnum(JobStatus)
  status!: JobStatus;
}
