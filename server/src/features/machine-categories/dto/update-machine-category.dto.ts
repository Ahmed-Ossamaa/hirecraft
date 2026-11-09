import { PartialType } from '@nestjs/swagger';
import { CreateMachineCategoryDto } from './create-machine-category.dto';
import { RequireAtLeastOne } from '@/common/decorators/require-at-least-one.decorator';

@RequireAtLeastOne()
export class UpdateMachineCategoryDto extends PartialType(
  CreateMachineCategoryDto,
) {}
