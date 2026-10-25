import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import plansConfig from '@/config/plans.config';
import { PlansService } from './services/plans.service';
import { PlansController } from './plans.controller';
import { PaymentModule } from '@/integrations/payment/payment.module';

@Module({
  imports: [ConfigModule.forFeature(plansConfig), PaymentModule],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
