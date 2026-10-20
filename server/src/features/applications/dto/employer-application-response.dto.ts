import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../domain/application-status.enum';

export class EmployerApplicationResponseDto {
  @ApiProperty({ description: 'The unique identifier of the application' })
  id!: string;

  @ApiProperty({ description: 'The ID of the job applied for' })
  jobId!: string;

  @ApiProperty({ description: 'The ID of the worker profile' })
  workerProfileId!: string;

  @ApiProperty({
    enum: ApplicationStatus,
    description: 'The status of the application',
  })
  status!: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'The cover letter provided by the candidate',
  })
  coverLetter?: string;

  @ApiProperty({
    description: 'Whether the application is archived',
    default: false,
  })
  isArchived!: boolean;

  @ApiProperty({
    description: 'Whether the application is starred',
    default: false,
  })
  isStarred!: boolean;

  @ApiPropertyOptional({
    description: 'The professional title of the applicant',
  })
  workerTitle?: string;

  @ApiPropertyOptional({ description: 'The full name of the applicant' })
  applicantName?: string;

  @ApiPropertyOptional({ description: 'The email of the applicant' })
  applicantEmail?: string;

  @ApiPropertyOptional({
    description: 'The avatar URL of the applicant',
    nullable: true,
  })
  applicantAvatar?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
