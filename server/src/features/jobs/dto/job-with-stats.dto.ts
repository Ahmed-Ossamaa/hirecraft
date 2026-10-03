import { ApiProperty } from '@nestjs/swagger';
import { Job } from '../domain/job.entity';

export class JobWithStatsDto extends Job {
  @ApiProperty({ description: 'Number of applications submitted for this job' })
  applicationCount!: number;
}
