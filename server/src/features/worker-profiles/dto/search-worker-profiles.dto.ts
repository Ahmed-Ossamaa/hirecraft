import { RequireAtLeastOne } from '@/common/decorators/require-at-least-one.decorator';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { ExperienceLevel } from '@/features/jobs/domain/exp-level.enum';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Max } from 'class-validator';
import { IsUUID } from 'class-validator';
import {
  MAX_WORKER_PROFILE_SEARCH_LIMIT,
  MAX_WORKER_PROFILE_SEARCH_PAGE,
} from '../worker-profile-search.constants';

@RequireAtLeastOne(['machineId', 'machineCategoryId'])
export class SearchWorkerProfilesDto extends OmitType(PageOptionsDto, [
  'sortBy',
  'order',
]) {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: MAX_WORKER_PROFILE_SEARCH_PAGE,
    default: 1,
  })
  @Max(MAX_WORKER_PROFILE_SEARCH_PAGE)
  page = 1;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: MAX_WORKER_PROFILE_SEARCH_LIMIT,
    default: MAX_WORKER_PROFILE_SEARCH_LIMIT,
  })
  @Max(MAX_WORKER_PROFILE_SEARCH_LIMIT)
  limit = MAX_WORKER_PROFILE_SEARCH_LIMIT;

  @ApiPropertyOptional({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsOptional()
  @IsUUID()
  machineCategoryId!: string;

  @ApiPropertyOptional({ example: 'b1ffcd00-0d1c-4fg9-cc7e-7cc0ce491b22' })
  @IsOptional()
  @IsUUID()
  machineId!: string;

  @ApiPropertyOptional({
    enum: ExperienceLevel,
    example: ExperienceLevel.SENIOR,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel!: ExperienceLevel;

  @ApiPropertyOptional({ example: 'Egypt' })
  @IsOptional()
  @IsString()
  country!: string;

  @ApiPropertyOptional({ example: 'Cairo' })
  @IsOptional()
  @IsString()
  city!: string;
}
