import { Module } from '@nestjs/common';
import { MachineCategoriesService } from './machine-categories.service';
import { MachineCategoriesController } from './machine-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineCategoryOrmEntity } from './infratsructure/machine-category.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([MachineCategoryOrmEntity])],
  controllers: [MachineCategoriesController],
  providers: [MachineCategoriesService],
})
export class MachineCategoriesModule {}
