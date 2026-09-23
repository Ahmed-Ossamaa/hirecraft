import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import plansConfig from '@/config/plans.config';
import { PlansService } from './services/plans.service';
import { PlansController } from './plans.controller';

@Module({
  imports: [ConfigModule.forFeature(plansConfig)],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
