import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/pagination/page-options.dto';
import { ExperienceLevel } from '../domain/exp-level.enum';
import { JobType } from '../domain/job-type.enum';

export class FindJobsQueryDto extends PageOptionsDto {
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
