import { ApiProperty } from '@nestjs/swagger';
import { PlanId } from './plan-id.enum';

export type PlanInterval = 'month' | 'year';

export class PlanLimits {
  @ApiProperty({
    example: 5,
    description: 'Maximum total job postings allowed per period',
  })
  maxJobPostings!: number;

  @ApiProperty({
    example: 3,
    description: 'Maximum concurrently active published jobs',
  })
  maxActiveJobs!: number;

  @ApiProperty({
    example: 3,
    description: 'Maximum team member seats',
  })
  maxUsers!: number;
}

export class Plan {
  @ApiProperty({
    enum: PlanId,
    enumName: 'PlanId',
    example: PlanId.STARTER_MONTHLY,
  })
  readonly id: PlanId;

  @ApiProperty({ example: 'Starter' })
  readonly name: string;

  @ApiProperty({ enum: ['month', 'year'], example: 'month' })
  readonly interval: PlanInterval;

  @ApiProperty({
    example: 1500,
    description: 'Plan price in major units (0 for free tier)',
  })
  readonly price: number;

  @ApiProperty({ example: 'EGP', description: 'Currency code' })
  readonly currency: string;

  @ApiProperty({
    example: 'price_1UC30dIa6NIi04iKJWYRhHhl',
    nullable: true,
  })
  readonly paymentPriceId: string | null;

  @ApiProperty({ type: () => PlanLimits })
  readonly limits: PlanLimits;

  constructor(
    id: PlanId,
    name: string,
    interval: PlanInterval,
    price: number,
    currency: string,
    paymentPriceId: string | null,
    limits: PlanLimits,
  ) {
    this.id = id;
    this.name = name;
    this.interval = interval;
    this.price = price;
    this.currency = currency;
    this.paymentPriceId = paymentPriceId;
    this.limits = limits;
  }

  get isFree(): boolean {
    return this.paymentPriceId === null;
  }

  get tierLevel(): number {
    const nameLower = this.name.toLowerCase();
    if (nameLower === 'starter') return 1;
    if (nameLower === 'pro' || nameLower === 'professional') return 2;
    if (nameLower === 'enterprise') return 3;
    return 0; // Free
  }
}
