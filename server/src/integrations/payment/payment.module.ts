import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import stripeConfig from '../../config/stripe.config';
import { StripePaymentProvider } from './stripe/stripe-payment-provider';
import { PAYMENT_PROVIDER } from '@/features/billing/domain/payment-provider.interface';

@Module({
  imports: [ConfigModule.forFeature(stripeConfig)],
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useClass: StripePaymentProvider,
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentModule {}
