import { NotFoundException } from '@nestjs/common';
import type { IAnalyticsReadRepository } from '../analytics/domain/repositories/analytics-read.repo.interface';
import { CompaniesAnalyticsService } from './companies-analytics.service';

describe('CompaniesAnalyticsService', () => {
  let service: CompaniesAnalyticsService;
  let analyticsRepo: jest.Mocked<
    Pick<IAnalyticsReadRepository, 'getMachinerySupplyAndDemand'>
  >;

  beforeEach(() => {
    analyticsRepo = {
      getMachinerySupplyAndDemand: jest.fn(),
    };
    service = new CompaniesAnalyticsService(
      analyticsRepo as IAnalyticsReadRepository,
    );
  });

  it('returns the selected machine market statistics', async () => {
    analyticsRepo.getMachinerySupplyAndDemand.mockResolvedValue([
      {
        machineId: 'machine-1',
        nameEn: 'Laser CNC',
        nameAr: 'ليزر',
        categoryEn: 'Cutting',
        categoryAr: 'قطع',
        activeJobsDemand: 4,
        distinctWorkersSupply: 2,
        supplyToDemandRatio: 0.5,
      },
    ]);

    await expect(service.getMachineryMetrics('machine-1')).resolves.toEqual({
      machines: [
        {
          machineId: 'machine-1',
          nameEn: 'Laser CNC',
          nameAr: 'ليزر',
          categoryEn: 'Cutting',
          categoryAr: 'قطع',
          activeJobsDemand: 4,
          distinctWorkersSupply: 2,
          supplyToDemandRatio: 0.5,
          marketStatus: 'SHORTAGE',
        },
      ],
    });
    expect(analyticsRepo.getMachinerySupplyAndDemand).toHaveBeenCalledWith(
      1,
      'machine-1',
    );
  });

  it('preserves zero demand and supply with a null ratio', async () => {
    analyticsRepo.getMachinerySupplyAndDemand.mockResolvedValue([
      {
        machineId: 'machine-1',
        nameEn: 'Laser CNC',
        nameAr: 'ليزر',
        categoryEn: 'Cutting',
        categoryAr: 'قطع',
        activeJobsDemand: 0,
        distinctWorkersSupply: 0,
        supplyToDemandRatio: null,
      },
    ]);

    await expect(
      service.getMachineryMetrics('machine-1'),
    ).resolves.toMatchObject({
      machines: [
        {
          activeJobsDemand: 0,
          distinctWorkersSupply: 0,
          supplyToDemandRatio: null,
          marketStatus: 'BALANCED',
        },
      ],
    });
  });

  it('returns not found when the selected machine is absent', async () => {
    analyticsRepo.getMachinerySupplyAndDemand.mockResolvedValue([]);

    await expect(
      service.getMachineryMetrics('missing-machine'),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns the top ten machines when no machine is selected', async () => {
    analyticsRepo.getMachinerySupplyAndDemand.mockResolvedValue([]);

    await expect(service.getMachineryMetrics()).resolves.toEqual({
      machines: [],
    });
    expect(analyticsRepo.getMachinerySupplyAndDemand).toHaveBeenCalledWith(
      10,
      undefined,
    );
  });
});
