import { PartialType } from '@nestjs/swagger';
import { CreateMachineDto } from './create-machine.dto';
import { RequireAtLeastOne } from '@/common/decorators/require-at-least-one.decorator';

@RequireAtLeastOne()
export class UpdateMachineDto extends PartialType(CreateMachineDto) {}
