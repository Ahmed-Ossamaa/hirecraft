import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { CurrentSubscriptionDto } from './billing-responses.dto';

export class ChangePlanDto {
  @ApiProperty({
    description: 'Target plan ID to upgrade, downgrade, or subscribe to',
    enum: PlanId,
  })
  @IsEnum(PlanId)
  @IsNotEmpty()
  planId!: PlanId;

  @ApiPropertyOptional({ description: 'Idempotency key for request' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}

export class ChangePlanResponseDto {
  @ApiProperty({
    enum: ['CHECKOUT', 'UPGRADED', 'DOWNGRADE_SCHEDULED'],
    description: 'The resulting action taken for the plan change request',
  })
  action!: 'CHECKOUT' | 'UPGRADED' | 'DOWNGRADE_SCHEDULED';

  @ApiPropertyOptional({
    description: 'Checkout URL if initial subscription from free tier',
  })
  url?: string | null;

  @ApiPropertyOptional({
    type: () => CurrentSubscriptionDto,
    description:
      'Updated subscription state if in-place upgrade or scheduled downgrade',
  })
  subscription?: CurrentSubscriptionDto;
}
