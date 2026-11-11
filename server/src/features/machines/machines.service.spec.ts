import { Test, TestingModule } from '@nestjs/testing';
import { MachinesService } from './machines.service';
import { MACHINE_REPOSITORY } from './domain/machine.repo.interface';

describe('MachinesService', () => {
  let service: MachinesService;
  const machineRepository = {
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
        MachinesService,
        { provide: MACHINE_REPOSITORY, useValue: machineRepository },
      ],
    }).compile();

    service = module.get<MachinesService>(MachinesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should rethrow unexpected repository errors when deleting a machine', async () => {
    const error = new Error('Unexpected repository failure');
    machineRepository.delete.mockRejectedValue(error);

    await expect(service.delete('machine-1')).rejects.toBe(error);
  });
});
