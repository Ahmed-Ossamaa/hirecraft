import { PartialType, OmitType } from '@nestjs/swagger';
import { AddMachineSkillDto } from './add-machine-skills.dto';
import { RequireAtLeastOne } from '@/common/decorators/require-at-least-one.decorator';

@RequireAtLeastOne()
export class UpdateMachineSkillDto extends PartialType(
  OmitType(AddMachineSkillDto, ['machineId']),
) {}
