import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller';
import { PlansService } from './services/plans.service';

describe('PlansController', () => {
  let controller: PlansController;
  let service: jest.Mocked<Partial<PlansService>>;

  beforeEach(async () => {
    service = {
      getPlansWithPrices: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [{ provide: PlansService, useValue: service }],
    }).compile();

    controller = module.get<PlansController>(PlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all plans with provider-enriched prices', async () => {
    const plans = await controller.getPlans();
    expect(service.getPlansWithPrices).toHaveBeenCalled();
    expect(plans).toEqual([]);
  });
});
