import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmCheckoutDto {
  @ApiProperty({
    description: 'The Stripe checkout session ID to confirm and reconcile',
    example:
      'cs_test_a1rz22c5o59bO8pQMHCAVcI4Z9kRJAlfvWrsMbFo2OPg1Ce29UeIRQIWe7',
  })
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
