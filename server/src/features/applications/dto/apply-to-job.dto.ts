import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobApplicationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  jobId!: string;

  @ApiPropertyOptional({
    example: 'I have 5 years of experience with modern CNC machines...',
  })
  @IsString()
  @IsOptional()
  coverLetter?: string;
}
