import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';

export class FindCompaniesQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search company by name/title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by exact industry sector' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Filter by exact country code or name' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by exact city name' })
  @IsOptional()
  @IsString()
  city?: string;
}
