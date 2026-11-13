import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ANALYTICS_READ_REPOSITORY,
  type IAnalyticsReadRepository,
} from '../analytics/domain/repositories/analytics-read.repo.interface';
import { classifyMachineryMarketStatus } from '../analytics/domain/utils/classify-machinery-market-status';

@Injectable()
export class CompaniesAnalyticsService {
  constructor(
    @Inject(ANALYTICS_READ_REPOSITORY)
    private readonly analyticsRepo: IAnalyticsReadRepository,
  ) {}

  async getMachineryMetrics(machineId?: string) {
    const machines = await this.analyticsRepo.getMachinerySupplyAndDemand(
      machineId ? 1 : 10,
      machineId,
    );

    if (machineId && machines.length === 0) {
      throw new NotFoundException(`Machine ${machineId} was not found.`);
    }

    return {
      machines: machines.map((machine) => ({
        ...machine,
        marketStatus: classifyMachineryMarketStatus(
          machine.supplyToDemandRatio,
          machine.distinctWorkersSupply,
        ),
      })),
    };
  }
}
