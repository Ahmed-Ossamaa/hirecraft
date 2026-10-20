import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ApplicationTab {
  ALL = 'ALL',
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  SCHEDULED = 'SCHEDULED',
  OFFERED = 'OFFERED',
  CLOSED = 'CLOSED',
  STARRED = 'STARRED',
  ARCHIVED = 'ARCHIVED',
}

export class GetJobApplicationsQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search candidate name by prefix' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ApplicationTab, default: ApplicationTab.ALL })
  @IsOptional()
  @IsEnum(ApplicationTab)
  tab?: ApplicationTab = ApplicationTab.ALL;
}
