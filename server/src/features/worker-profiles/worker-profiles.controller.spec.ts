import { Test, TestingModule } from '@nestjs/testing';
import { WorkerProfilesController } from './worker-profiles.controller';
import { WorkerProfilesService } from './worker-profiles.service';

describe('WorkerProfilesController', () => {
  let controller: WorkerProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkerProfilesController],
      providers: [WorkerProfilesService],
    }).compile();

    controller = module.get<WorkerProfilesController>(WorkerProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
