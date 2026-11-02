import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

export class AdminBillingQueryDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Search by company name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: SubscriptionStatus,
    description: 'Filter by subscription status',
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ enum: PlanId, description: 'Filter by plan ID' })
  @IsOptional()
  @IsEnum(PlanId)
  planId?: PlanId;
}
