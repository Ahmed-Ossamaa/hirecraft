import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import plansConfiguration from '@/config/plans.config';
import { PlanId } from '../domain/plan-id.enum';
import { PAYMENT_PROVIDER } from '@/integrations/payment/domain/payment-provider.interface';

describe('PlansService (Domain)', () => {
  let service: PlansService;

  const mockPricesConfig = {
    prices: {
      starterMonthly: 'price_starter_mo',
      starterYearly: 'price_starter_yr',
      proMonthly: 'price_pro_mo',
      proYearly: 'price_pro_yr',
      enterpriseMonthly: 'price_ent_mo',
      enterpriseYearly: 'price_ent_yr',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: plansConfiguration.KEY,
          useValue: mockPricesConfig,
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
  });

  it('should be defined and initialize domain plans without provider coupling', () => {
    expect(service).toBeDefined();

    const plans = service.getPlans();
    expect(plans.length).toBe(7);

    const freePlan = service.getPlanById(PlanId.FREE_MONTHLY);
    expect(freePlan.name).toBe('Free');
    expect(freePlan.isFree).toBe(true);
    expect(freePlan.limits.maxActiveJobs).toBe(1);

    const starterMo = service.getPlanById(PlanId.STARTER_MONTHLY);
    expect(starterMo.name).toBe('Starter');
    expect(starterMo.paymentPriceId).toBe('price_starter_mo');
    expect(starterMo.limits.maxActiveJobs).toBe(3);

    const proYr = service.getPlanById(PlanId.PRO_YEARLY);
    expect(proYr.name).toBe('Pro');
    expect(proYr.paymentPriceId).toBe('price_pro_yr');
    expect(proYr.limits.maxActiveJobs).toBe(10);
  });

  it('should lookup plan by external payment price ID', () => {
    const plan = service.getPlanByPaymentPriceId('price_pro_mo');
    expect(plan.id).toBe(PlanId.PRO_MONTHLY);
    expect(plan.limits.maxUsers).toBe(10);
  });

  it('should throw NotFoundException for invalid plan ID or price ID', () => {
    expect(() => service.getPlanById('non-existent' as any)).toThrow();
    expect(() =>
      service.getPlanByPaymentPriceId('non-existent-price'),
    ).toThrow();
  });

  it('should return base plans when no payment provider is injected', async () => {
    const plans = await service.getPlansWithPrices();
    expect(plans.length).toBe(7);
    const starterMo = plans.find((p) => p.id === PlanId.STARTER_MONTHLY);
    expect(starterMo?.price).toBe(0);
  });

  it('should enrich plans with provider prices when payment provider is injected', async () => {
    const mockProvider = {
      getPrices: jest.fn().mockResolvedValue(
        new Map([
          [
            'price_starter_mo',
            {
              priceId: 'price_starter_mo',
              unitAmount: 49900,
              currency: 'EGP',
              interval: 'month',
              productName: 'Starter Plan',
            },
          ],
        ]),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: plansConfiguration.KEY,
          useValue: mockPricesConfig,
        },
        {
          provide: PAYMENT_PROVIDER,
          useValue: mockProvider,
        },
      ],
    }).compile();

    const providerService = module.get<PlansService>(PlansService);
    const plans = await providerService.getPlansWithPrices();
    const starterMo = plans.find((p) => p.id === PlanId.STARTER_MONTHLY);
    expect(starterMo?.price).toBe(49900);
    expect(starterMo?.currency).toBe('EGP');
  });
});
