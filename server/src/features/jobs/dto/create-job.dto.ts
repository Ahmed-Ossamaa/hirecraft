import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../domain/job-status.enum';
import { JobType } from '../domain/job-type.enum';
import { ExperienceLevel } from '../domain/exp-level.enum';

export class CreateJobDto {
  @ApiProperty({ example: 'Offset Printing Technician' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example: 'We are looking for an Offset Printing Technician...',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  machineCategoryId!: string;

  @ApiProperty({ example: '987e6543-e21b-34d1-b654-426614174999' })
  @IsUUID()
  @IsNotEmpty()
  machineId!: string;

  @ApiProperty({ enum: ExperienceLevel, example: ExperienceLevel.SENIOR })
  @IsEnum(ExperienceLevel)
  @IsNotEmpty()
  experienceLevel!: ExperienceLevel;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.DRAFT })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ enum: JobType, default: JobType.FULL_TIME })
  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @ApiProperty({ example: ' Egypt' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;

  @ApiProperty({ example: 'Alexandria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ example: '15k - 20k' })
  @IsString()
  @IsOptional()
  salaryRange?: string;
}
