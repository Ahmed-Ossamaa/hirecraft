import { Module } from '@nestjs/common';
import { MachineCategoriesService } from './machine-categories.service';
import { MachineCategoriesController } from './machine-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineCategoryOrmEntity } from './infrastructure/machine-category.orm-entity';
import { MACHINE_CATEGORY_REPOSITORY } from './domain/machine-category.repo.interface';
import { MachineCategoryTypeormRepository } from './infrastructure/machine-category.typeorm.repo';

@Module({
  imports: [TypeOrmModule.forFeature([MachineCategoryOrmEntity])],
  controllers: [MachineCategoriesController],
  providers: [
    MachineCategoriesService,
    {
      provide: MACHINE_CATEGORY_REPOSITORY,
      useClass: MachineCategoryTypeormRepository,
    },
  ],
})
export class MachineCategoriesModule {}
