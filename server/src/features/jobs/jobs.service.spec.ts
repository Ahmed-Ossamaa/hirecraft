import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { JOB_REPOSITORY } from './domain/job.repo.interface';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: JOB_REPOSITORY,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCompanyId: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
