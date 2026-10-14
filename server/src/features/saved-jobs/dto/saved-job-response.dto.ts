import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Job } from '@/features/jobs/domain/job.entity';

export class SavedJobResponseDto {
  @ApiProperty({ description: 'The unique identifier of the saved job record' })
  id!: string;

  @ApiProperty({ description: 'The ID of the user who saved the job' })
  userId!: string;

  @ApiProperty({ description: 'The ID of the saved job' })
  jobId!: string;

  @ApiProperty({ description: 'When the job was saved' })
  createdAt!: Date;

  @ApiPropertyOptional({
    type: () => Job,
    description: 'The associated job details with company information',
  })
  job?: Job;
}
