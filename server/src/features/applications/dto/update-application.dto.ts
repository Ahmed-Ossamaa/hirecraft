import { IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../domain/application-status.enum';

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}

export class UpdateApplicationArchiveDto {
  @ApiProperty({ description: 'Archive status of the application' })
  @IsBoolean()
  isArchived!: boolean;
}

export class UpdateApplicationStarDto {
  @ApiProperty({
    description: 'Starred / bookmarked status of the application',
  })
  @IsBoolean()
  isStarred!: boolean;
}
