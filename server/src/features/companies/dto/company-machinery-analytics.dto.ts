import { ApiProperty } from '@nestjs/swagger';
import type { MachineryMarketStatus } from '@/features/analytics/domain/utils/classify-machinery-market-status';

export class CompanyMachineryMarketMetricDto {
  @ApiProperty()
  machineId!: string;

  @ApiProperty()
  nameEn!: string;

  @ApiProperty()
  nameAr!: string;

  @ApiProperty()
  categoryEn!: string;

  @ApiProperty()
  categoryAr!: string;

  @ApiProperty({
    description: 'Active published, non-expired jobs requiring this machine',
  })
  activeJobsDemand!: number;

  @ApiProperty({
    description: 'Distinct worker profiles skilled on this machine',
  })
  distinctWorkersSupply!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Supply divided by demand; null when demand is zero',
  })
  supplyToDemandRatio!: number | null;

  @ApiProperty({ enum: ['SHORTAGE', 'BALANCED', 'SURPLUS'] })
  marketStatus!: MachineryMarketStatus;
}

export class CompanyMachineryAnalyticsResponseDto {
  @ApiProperty({ type: [CompanyMachineryMarketMetricDto] })
  machines!: CompanyMachineryMarketMetricDto[];
}
