import { IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExperienceLevel } from '@/features/jobs/domain/exp-level.enum';

export class AddMachineSkillDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  machineId!: string;

  @ApiProperty({ enum: ExperienceLevel, example: ExperienceLevel.SENIOR })
  @IsEnum(ExperienceLevel)
  experienceLevel!: ExperienceLevel;

  @ApiProperty({
    example: 5,
    description: 'Years of experience on this specific machine',
  })
  @IsInt()
  @Min(0)
  yearsOfExperience!: number;
}
