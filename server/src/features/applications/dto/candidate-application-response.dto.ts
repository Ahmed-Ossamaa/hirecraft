import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CandidateApplicationStatus } from '../domain/application-status.enum';

export class CandidateApplicationResponseDto {
  @ApiProperty({ description: 'The unique identifier of the application' })
  id!: string;

  @ApiProperty({ description: 'The ID of the job applied for' })
  jobId!: string;

  @ApiPropertyOptional({ description: 'The title of the job applied for' })
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'The name of the company that owns the job',
  })
  companyName?: string;

  @ApiPropertyOptional({
    description: 'The ID of the company that owns the job',
  })
  companyId?: string;

  @ApiProperty({
    enum: CandidateApplicationStatus,
    description: 'The status of the application',
  })
  status!: CandidateApplicationStatus;

  @ApiPropertyOptional({
    description: 'The cover letter provided by the candidate',
  })
  coverLetter?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
