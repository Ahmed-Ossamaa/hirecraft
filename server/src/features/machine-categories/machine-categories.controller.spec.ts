import { Test, TestingModule } from '@nestjs/testing';
import { MachineCategoriesController } from './machine-categories.controller';
import { MachineCategoriesService } from './machine-categories.service';

describe('MachineCategoriesController', () => {
  let controller: MachineCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MachineCategoriesController],
      providers: [
        {
          provide: MachineCategoriesService,
          useValue: { findAll: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<MachineCategoriesController>(
      MachineCategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
