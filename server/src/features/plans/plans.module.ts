import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import plansConfig from '@/config/plans.config';
import { PlansService } from './services/plans.service';

@Module({
  imports: [ConfigModule.forFeature(plansConfig)],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
