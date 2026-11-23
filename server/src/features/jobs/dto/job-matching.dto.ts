import { ApiProperty } from '@nestjs/swagger';
import { ExperienceLevel } from '../domain/exp-level.enum';

export class JobMatchingCriteriaDto {
  @ApiProperty({ format: 'uuid' })
  machineCategoryId!: string;

  @ApiProperty({ format: 'uuid' })
  machineId!: string;

  @ApiProperty({ enum: ExperienceLevel })
  experienceLevel!: ExperienceLevel;

  @ApiProperty({ example: 'Egypt' })
  country!: string;

  @ApiProperty({ example: 'Alexandria' })
  city!: string;
}
