import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'The ID of the plan to subscribe to',
    enum: PlanId,
  })
  @IsEnum(PlanId)
  @IsNotEmpty()
  planId!: PlanId;

  @ApiPropertyOptional({ description: 'Idempotency key for retry' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
