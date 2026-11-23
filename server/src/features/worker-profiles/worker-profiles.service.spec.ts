import { Test, TestingModule } from '@nestjs/testing';
import { WorkerProfilesService } from './worker-profiles.service';
import {
  WORKER_PROFILE_REPOSITORY,
  WorkerProfileRepositoryInterface,
} from './domain/worker-profile.repo.interface';
import { SearchWorkerProfilesDto } from './dto/search-worker-profiles.dto';

describe('WorkerProfilesService', () => {
  let service: WorkerProfilesService;
  let profileRepository: jest.Mocked<
    Pick<WorkerProfileRepositoryInterface, 'findByCriteria'>
  >;

  beforeEach(async () => {
    profileRepository = {
      findByCriteria: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerProfilesService,
        {
          provide: WORKER_PROFILE_REPOSITORY,
          useValue: profileRepository,
        },
      ],
    }).compile();

    service = module.get<WorkerProfilesService>(WorkerProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('passes pagination options separately from search criteria', async () => {
    const query = Object.assign(new SearchWorkerProfilesDto(), {
      machineId: 'machine-id',
      country: 'Egypt',
      page: 2,
      limit: 15,
    });

    profileRepository.findByCriteria.mockResolvedValue({
      data: [],
      page: 2,
      limit: 15,
      hasNext: false,
    });

    await service.searchWorkers(query);

    expect(profileRepository.findByCriteria).toHaveBeenCalledWith(
      expect.objectContaining({
        machineId: 'machine-id',
        country: 'Egypt',
      }),
      { page: 2, limit: 15 },
    );
  });
});
