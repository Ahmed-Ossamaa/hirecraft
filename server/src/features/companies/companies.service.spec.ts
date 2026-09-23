import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { COMPANY_REPOSITORY } from './domain/company.repo.interface';
import { STORAGE_SERVICE } from '@/integrations/storage/storage.interface';

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: COMPANY_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: STORAGE_SERVICE,
          useValue: {
            uploadImage: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
