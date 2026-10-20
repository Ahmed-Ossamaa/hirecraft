import { ApiProperty } from '@nestjs/swagger';

export class JobApplicationStatsDto {
  @ApiProperty({
    description: 'Total applications for this job (including archived)',
  })
  total!: number;

  @ApiProperty({ description: 'Active applications pending review' })
  pending!: number;

  @ApiProperty({
    description:
      'Active applications in progress (shortlisted or interview scheduled)',
  })
  inProgress!: number;

  @ApiProperty({
    description:
      'Active applications in offers stage (offered, offer accepted, or offer declined)',
  })
  offers!: number;

  @ApiProperty({ description: 'Active applications with offer accepted' })
  offersAccepted!: number;
}
