import { PartialType } from '@nestjs/swagger';
import { CreateWorkerProfileDto } from './create-worker-profile.dto';
import { RequireAtLeastOne } from '@/common/decorators/require-at-least-one.decorator';

@RequireAtLeastOne()
export class UpdateWorkerProfileDto extends PartialType(
  CreateWorkerProfileDto,
) {}
