import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Plan } from '@/features/plans/domain/plan.entity';
import { SubscriptionStatus } from '../domain/subscription-status.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

export class CurrentSubscriptionDto {
  @ApiPropertyOptional()
  id!: string | null;

  @ApiProperty()
  companyId!: string;

  @ApiProperty({ enum: PlanId })
  planId!: PlanId;

  @ApiProperty()
  plan!: Plan;

  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @ApiPropertyOptional({ type: Date })
  currentPeriodStart!: Date | null;

  @ApiPropertyOptional({ type: Date })
  currentPeriodEnd!: Date | null;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;
}

export class CancelSubscriptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiProperty({ type: Date })
  currentPeriodEnd!: Date;
}
