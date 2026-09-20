import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty({ example: 'https://checkout.stripe.com/...' })
  url: string;
}
