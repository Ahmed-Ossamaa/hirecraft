import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';

export class AdminCompaniesQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search term for company name' })
  @IsOptional()
  @IsString()
  search?: string;
}
