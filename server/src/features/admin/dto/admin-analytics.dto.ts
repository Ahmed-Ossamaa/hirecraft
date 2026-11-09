import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum AnalyticsTimeRange {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  TWELVE_MONTHS = '12m',
  ALL = 'all',
}

export class AdminAnalyticsRangeQueryDto {
  @ApiPropertyOptional({
    enum: AnalyticsTimeRange,
    default: AnalyticsTimeRange.THIRTY_DAYS,
    description: 'Time range for analytics metrics',
  })
  @IsOptional()
  @IsEnum(AnalyticsTimeRange)
  range?: AnalyticsTimeRange = AnalyticsTimeRange.THIRTY_DAYS;
}

export class AdminKpiMetricsDto {
  @ApiProperty({
    description: 'Current Monthly Recurring Revenue in platform currency',
  })
  currentMrr!: number;

  @ApiProperty({
    description: 'Current Annual Recurring Revenue in platform currency',
  })
  currentArr!: number;

  @ApiProperty({ example: 'EGP' })
  currency!: string;

  @ApiProperty({ description: 'Total active paying subscriptions snapshot' })
  activePaidSubscriptions!: number;

  @ApiProperty({ description: 'Total registered platform users snapshot' })
  totalUsers!: number;

  @ApiProperty({ description: 'New users registered in the selected period' })
  newUsersInPeriod!: number;

  @ApiProperty({
    nullable: true,
    description:
      'User registration growth % compared to prior equivalent period (null if prev is 0)',
  })
  usersPeriodDelta!: number | null;

  @ApiProperty({
    description: 'Current active, published, non-expired jobs snapshot',
  })
  activeJobs!: number;

  @ApiProperty({ description: 'Job postings published in selected period' })
  newJobsInPeriod!: number;

  @ApiProperty({
    nullable: true,
    description: 'Job posting growth % compared to prior equivalent period',
  })
  jobsPeriodDelta!: number | null;

  @ApiProperty({
    description: 'Total job applications submitted in selected period',
  })
  totalApplicationsInPeriod!: number;

  @ApiProperty({
    nullable: true,
    description:
      'Application volume growth % compared to prior equivalent period',
  })
  applicationsPeriodDelta!: number | null;

  @ApiProperty({
    description: 'Offers accepted (placements) in selected period',
  })
  placementsInPeriod!: number;

  @ApiProperty({
    nullable: true,
    description: 'Placement growth % compared to prior equivalent period',
  })
  placementsPeriodDelta!: number | null;
}

export class AdminUserGrowthPointDto {
  @ApiProperty({ example: '2026-10-01' })
  date!: string;

  @ApiProperty({ example: 12 })
  candidates!: number;

  @ApiProperty({ example: 3 })
  employers!: number;

  @ApiProperty({ example: 15 })
  total!: number;
}

export class AdminUserGrowthSummaryDto {
  @ApiProperty({ example: 45 })
  candidatesNew!: number;

  @ApiProperty({ example: 10 })
  employersNew!: number;

  @ApiProperty({ example: 55 })
  totalNew!: number;

  @ApiProperty({ nullable: true, example: 14.5 })
  periodDelta!: number | null;
}

export class AdminUserGrowthResponseDto {
  @ApiProperty({ enum: AnalyticsTimeRange, example: '30d' })
  range!: AnalyticsTimeRange;

  @ApiProperty({ example: 'day' })
  granularity!: 'day' | 'week' | 'month';

  @ApiProperty({ type: [AdminUserGrowthPointDto] })
  points!: AdminUserGrowthPointDto[];

  @ApiProperty({ type: AdminUserGrowthSummaryDto })
  summary!: AdminUserGrowthSummaryDto;
}

export class AdminRevenuePlanBreakdownDto {
  @ApiProperty({ example: 'starter-monthly' })
  planId!: string;

  @ApiProperty({ example: 'Starter' })
  planName!: string;

  @ApiProperty({ example: 8 })
  subscriberCount!: number;

  @ApiProperty({ example: 12000 })
  monthlyRevenueContribution!: number;

  @ApiProperty({ example: 45.5, description: 'Percentage share of total MRR' })
  revenuePercentage!: number;
}

export class AdminRevenueAnalyticsResponseDto {
  @ApiProperty({ example: 25000 })
  currentMrr!: number;

  @ApiProperty({ example: 300000 })
  currentArr!: number;

  @ApiProperty({ example: 'EGP' })
  currency!: string;

  @ApiProperty({ example: 14 })
  activePaidSubscriptions!: number;

  @ApiProperty({ type: [AdminRevenuePlanBreakdownDto] })
  planDistribution!: AdminRevenuePlanBreakdownDto[];
}

export class AdminRecruitmentStatusItemDto {
  @ApiProperty({ example: 'PENDING' })
  status!: string;

  @ApiProperty({ example: 'Pending Review' })
  label!: string;

  @ApiProperty({ example: 24 })
  count!: number;

  @ApiProperty({ example: 40.0 })
  percentage!: number;
}

export class AdminRecruitmentAnalyticsResponseDto {
  @ApiProperty({ enum: AnalyticsTimeRange, example: '30d' })
  range!: AnalyticsTimeRange;

  @ApiProperty({ example: 60 })
  totalApplications!: number;

  @ApiProperty({ example: 8 })
  placementsCount!: number;

  @ApiProperty({ example: 12 })
  rejectedCount!: number;

  @ApiProperty({ example: 4 })
  withdrawnCount!: number;

  @ApiProperty({ type: [AdminRecruitmentStatusItemDto] })
  statusDistribution!: AdminRecruitmentStatusItemDto[];
}

export class AdminMachineSupplyDemandItemDto {
  @ApiProperty({ example: 'b9d3b841-8656-42bc-9d04-582cb5b3d641' })
  machineId!: string;

  @ApiProperty({ example: 'CNC Milling 5-Axis' })
  nameEn!: string;

  @ApiProperty({ example: 'فرازة سي إن سي 5 محاور' })
  nameAr!: string;

  @ApiProperty({ example: 'Milling Machines' })
  categoryEn!: string;

  @ApiProperty({ example: 'ماكينات التفريز' })
  categoryAr!: string;

  @ApiProperty({
    example: 15,
    description: 'Active published non-expired jobs requiring this machine',
  })
  activeJobsDemand!: number;

  @ApiProperty({
    example: 28,
    description: 'Distinct worker profiles skilled on this machine',
  })
  distinctWorkersSupply!: number;

  @ApiProperty({
    nullable: true,
    example: 1.87,
    description: 'Supply / Demand ratio (null if demand is 0)',
  })
  supplyToDemandRatio!: number | null;

  @ApiProperty({
    enum: ['SHORTAGE', 'BALANCED', 'SURPLUS'],
    example: 'SURPLUS',
  })
  marketStatus!: 'SHORTAGE' | 'BALANCED' | 'SURPLUS';
}

export class AdminMachineryAnalyticsResponseDto {
  @ApiProperty({ type: [AdminMachineSupplyDemandItemDto] })
  machines!: AdminMachineSupplyDemandItemDto[];
}
