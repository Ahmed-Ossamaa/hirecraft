import { PartialType } from '@nestjs/swagger';
import { CreateJobDto } from './create-job.dto';
import { RequireAtLeastOne } from '@/common/decorators/require-at-least-one.decorator';

@RequireAtLeastOne()
export class UpdateJobDto extends PartialType(CreateJobDto) {}
