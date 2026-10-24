import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plan } from '@/features/plans/domain/plan.entity';
import { SubscriptionStatus } from '../domain/subscription-status.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

export class SubscriptionUsageDto {
  @ApiProperty({ description: 'Number of currently active published jobs' })
  activeJobs!: number;

  @ApiProperty({
    description: 'Number of job posting credits used in current billing cycle',
  })
  jobPostingsUsed!: number;

  @ApiProperty({ description: 'Total active and pending team member seats' })
  teamMembersCount!: number;
}

export class CurrentSubscriptionDto {
  @ApiPropertyOptional()
  id!: string | null;

  @ApiProperty()
  companyId!: string;

  @ApiProperty({ enum: PlanId })
  planId!: PlanId;

  @ApiProperty({ type: () => Plan })
  plan!: Plan;

  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @ApiPropertyOptional({ type: Date })
  currentPeriodStart!: Date | null;

  @ApiPropertyOptional({ type: Date })
  currentPeriodEnd!: Date | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiPropertyOptional({ enum: PlanId })
  scheduledPlanId?: PlanId | null;

  @ApiPropertyOptional({ type: () => Plan })
  scheduledPlan?: Plan | null;

  @ApiPropertyOptional({ type: () => SubscriptionUsageDto })
  usage?: SubscriptionUsageDto;
}

export class CancelSubscriptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiProperty({ type: Date })
  currentPeriodEnd!: Date;
}
