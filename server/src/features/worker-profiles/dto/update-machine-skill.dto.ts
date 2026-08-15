import { PartialType, OmitType } from '@nestjs/swagger';
import { AddMachineSkillDto } from './add-machine-skills.dto';

export class UpdateMachineSkillDto extends PartialType(
  OmitType(AddMachineSkillDto, ['machineId']),
) {}
