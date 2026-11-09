import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { IsOptional, IsString } from 'class-validator';

export class MachineQueryDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
