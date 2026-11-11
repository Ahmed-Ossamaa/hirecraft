import { Test, TestingModule } from '@nestjs/testing';
import { MachineCategoriesService } from './machine-categories.service';
import { MACHINE_CATEGORY_REPOSITORY } from './domain/machine-category.repo.interface';

describe('MachineCategoriesService', () => {
  let service: MachineCategoriesService;
  const categoryRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MachineCategoriesService,
        {
          provide: MACHINE_CATEGORY_REPOSITORY,
          useValue: categoryRepository,
        },
      ],
    }).compile();

    service = module.get<MachineCategoriesService>(MachineCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
