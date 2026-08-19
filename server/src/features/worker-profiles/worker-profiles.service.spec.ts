import { Test, TestingModule } from '@nestjs/testing';
import { WorkerProfilesService } from './worker-profiles.service';

describe('WorkerProfilesService', () => {
  let service: WorkerProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkerProfilesService],
    }).compile();

    service = module.get<WorkerProfilesService>(WorkerProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
