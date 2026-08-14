import { Module } from '@nestjs/common';
import { MachineCategoriesService } from './machine-categories.service';
import { MachineCategoriesController } from './machine-categories.controller';

@Module({
  controllers: [MachineCategoriesController],
  providers: [MachineCategoriesService],
})
export class MachineCategoriesModule {}
