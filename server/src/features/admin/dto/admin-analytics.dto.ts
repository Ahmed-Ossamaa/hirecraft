import { ApiProperty } from '@nestjs/swagger';

export class AdminOverviewStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalCompanies: number;

  @ApiProperty()
  activeJobs: number;

  @ApiProperty()
  activeSubscriptions: number;
}

export class DeferredAnalyticsResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ nullable: true })
  data: any;
}
