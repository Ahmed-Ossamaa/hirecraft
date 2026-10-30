import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';
import { Subscription } from '@/features/billing/domain/subscription.entity';

export class AdminSubscriptionResponseDto {
  @ApiProperty({ example: 'b5c92882-571e-56cf-cc69-2gfdc84fb022' })
  id!: string;

  @ApiProperty({ example: 'a4b82771-460d-45be-bb58-1fecb73fa911' })
  companyId!: string;

  @ApiProperty({ example: 'STARTER_MONTHLY' })
  planId!: string;

  @ApiProperty({ example: 'STRIPE' })
  provider!: string;

  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  status!: SubscriptionStatus;

  @ApiProperty()
  currentPeriodStart!: Date;

  @ApiProperty()
  currentPeriodEnd!: Date;

  @ApiProperty({ example: false })
  cancelAtPeriodEnd!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(sub: Subscription): AdminSubscriptionResponseDto {
    const dto = new AdminSubscriptionResponseDto();
    dto.id = sub.id;
    dto.companyId = sub.companyId;
    dto.planId = sub.planId;
    dto.provider = sub.provider;
    dto.status = sub.status;
    dto.currentPeriodStart = sub.currentPeriodStart;
    dto.currentPeriodEnd = sub.currentPeriodEnd;
    dto.cancelAtPeriodEnd = sub.cancelAtPeriodEnd;
    dto.createdAt = sub.createdAt;
    dto.updatedAt = sub.updatedAt;
    return dto;
  }
}
