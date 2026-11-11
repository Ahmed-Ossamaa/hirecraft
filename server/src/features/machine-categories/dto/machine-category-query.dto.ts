import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { IsOptional, IsString } from 'class-validator';

export class MachineCategoryQueryDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  q?: string;
}
