import { Test, TestingModule } from '@nestjs/testing';
import { MachineCategoriesService } from './machine-categories.service';

describe('MachineCategoriesService', () => {
  let service: MachineCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MachineCategoriesService],
    }).compile();

    service = module.get<MachineCategoriesService>(MachineCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
