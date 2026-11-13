import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsService } from './admin-analytics.service';
import { ANALYTICS_READ_REPOSITORY } from '@/features/analytics/domain/repositories/analytics-read.repo.interface';
import { PlansService } from '@/features/plans/services/plans.service';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { SubscriptionStatus } from '@/features/billing/domain/subscription-status.enum';
import { ApplicationStatus } from '@/features/applications/domain/application-status.enum';
import { Plan } from '@/features/plans/domain/plan.entity';

describe('AdminAnalyticsService', () => {
  let service: AdminAnalyticsService;

  const mockAnalyticsRepo = {
    getPlatformUserGrowthTimeSeries: jest.fn(),
    getPlatformUserCounts: jest.fn(),
    getPlatformActiveJobCount: jest.fn(),
    getPlatformJobPostingsCount: jest.fn(),
    getPlatformActiveSubscriptions: jest.fn(),
    getPlatformApplicationStatusDistribution: jest.fn(),
    getMachinerySupplyAndDemand: jest.fn(),
    getPlatformEarliestRecordDate: jest.fn(),
  };

  const mockPlansService = {
    getPlansWithPrices: jest.fn(),
    getPlanById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const starterMonthly = new Plan(
      PlanId.STARTER_MONTHLY,
      'Starter',
      'month',
      1500,
      'EGP',
      'price_starter_m',
      { maxJobPostings: 5, maxActiveJobs: 3, maxUsers: 3 },
    );
    const starterYearly = new Plan(
      PlanId.STARTER_YEARLY,
      'Starter',
      'year',
      12000,
      'EGP',
      'price_starter_y',
      { maxJobPostings: 60, maxActiveJobs: 3, maxUsers: 3 },
    );
    const freePlan = new Plan(
      PlanId.FREE_MONTHLY,
      'Free',
      'month',
      0,
      'EGP',
      null,
      { maxJobPostings: 1, maxActiveJobs: 1, maxUsers: 1 },
    );

    mockPlansService.getPlansWithPrices.mockResolvedValue([
      starterMonthly,
      starterYearly,
      freePlan,
    ]);
    mockPlansService.getPlanById.mockImplementation((id: PlanId) => {
      if (id === PlanId.STARTER_MONTHLY) return starterMonthly;
      if (id === PlanId.STARTER_YEARLY) return starterYearly;
      return freePlan;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAnalyticsService,
        {
          provide: ANALYTICS_READ_REPOSITORY,
          useValue: mockAnalyticsRepo,
        },
        {
          provide: PlansService,
          useValue: mockPlansService,
        },
      ],
    }).compile();

    service = module.get<AdminAnalyticsService>(AdminAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRevenueMetrics', () => {
    it('should correctly normalize MRR (annual / 12), exclude free, and calculate ARR', async () => {
      mockAnalyticsRepo.getPlatformActiveSubscriptions.mockResolvedValue([
        {
          id: 'sub-1',
          companyId: 'comp-1',
          planId: PlanId.STARTER_MONTHLY,
          amount: 1500,
          currency: 'EGP',
          billingInterval: 'month',
          providerPriceId: 'price_starter_m',
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
        },
        {
          id: 'sub-2',
          companyId: 'comp-2',
          planId: PlanId.STARTER_YEARLY,
          amount: 12000,
          currency: 'EGP',
          billingInterval: 'year',
          providerPriceId: 'price_starter_y',
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
        },
        {
          id: 'sub-3',
          companyId: 'comp-3',
          planId: PlanId.FREE_MONTHLY,
          amount: 0,
          currency: 'EGP',
          billingInterval: 'month',
          providerPriceId: null,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
        },
        {
          id: 'sub-4-past-due',
          companyId: 'comp-4',
          planId: PlanId.STARTER_MONTHLY,
          amount: 1500,
          currency: 'EGP',
          billingInterval: 'month',
          providerPriceId: 'price_starter_m',
          status: SubscriptionStatus.PAST_DUE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
        },
      ]);

      const revenue = await service.getRevenueMetrics();

      expect(revenue.currency).toBe('EGP');
      // 1500 + (12000 / 12) = 2500 MRR
      expect(revenue.currentMrr).toBe(2500);
      expect(revenue.currentArr).toBe(30000); // 2500 * 12
      expect(revenue.activePaidSubscriptions).toBe(2);
      expect(revenue.planDistribution).toHaveLength(2);
    });
  });

  describe('getOverviewStats', () => {
    it('should compute overview KPI metrics with period comparison deltas', async () => {
      mockAnalyticsRepo.getPlatformActiveSubscriptions.mockResolvedValue([]);
      mockAnalyticsRepo.getPlatformUserCounts
        .mockResolvedValueOnce({ total: 100, candidates: 80, employers: 20 }) // total snapshot
        .mockResolvedValueOnce({ total: 30, candidates: 25, employers: 5 }) // current period
        .mockResolvedValueOnce({ total: 20, candidates: 15, employers: 5 }); // previous period
      mockAnalyticsRepo.getPlatformActiveJobCount.mockResolvedValue(15);
      mockAnalyticsRepo.getPlatformJobPostingsCount
        .mockResolvedValueOnce(12) // current jobs
        .mockResolvedValueOnce(10); // prev jobs
      mockAnalyticsRepo.getPlatformApplicationStatusDistribution
        .mockResolvedValueOnce([
          { status: ApplicationStatus.OFFER_ACCEPTED, count: 5 },
          { status: ApplicationStatus.PENDING, count: 15 },
        ])
        .mockResolvedValueOnce([
          { status: ApplicationStatus.OFFER_ACCEPTED, count: 4 },
          { status: ApplicationStatus.PENDING, count: 10 },
        ]);

      const stats = await service.getOverviewStats();

      expect(stats.totalUsers).toBe(100);
      expect(stats.newUsersInPeriod).toBe(30);
      // ((30 - 20) / 20) * 100 = +50.0%
      expect(stats.usersPeriodDelta).toBe(50.0);
      expect(stats.activeJobs).toBe(15);
      expect(stats.newJobsInPeriod).toBe(12);
      // ((12 - 10) / 10) * 100 = +20.0%
      expect(stats.jobsPeriodDelta).toBe(20.0);
      expect(stats.totalApplicationsInPeriod).toBe(20);
      expect(stats.placementsInPeriod).toBe(5);
    });

    it('should return null delta when previous period is 0 and current > 0', async () => {
      mockAnalyticsRepo.getPlatformActiveSubscriptions.mockResolvedValue([]);
      mockAnalyticsRepo.getPlatformUserCounts
        .mockResolvedValueOnce({ total: 10, candidates: 8, employers: 2 })
        .mockResolvedValueOnce({ total: 10, candidates: 8, employers: 2 })
        .mockResolvedValueOnce({ total: 0, candidates: 0, employers: 0 }); // prev is 0
      mockAnalyticsRepo.getPlatformActiveJobCount.mockResolvedValue(5);
      mockAnalyticsRepo.getPlatformJobPostingsCount
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0); // prev is 0
      mockAnalyticsRepo.getPlatformApplicationStatusDistribution
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const stats = await service.getOverviewStats();

      expect(stats.usersPeriodDelta).toBeNull();
      expect(stats.jobsPeriodDelta).toBeNull();
    });
  });

  describe('getMachineryMetrics', () => {
    it('should identify market shortages and surpluses correctly', async () => {
      mockAnalyticsRepo.getMachinerySupplyAndDemand.mockResolvedValue([
        {
          machineId: 'm1',
          nameEn: 'CNC Lathe',
          nameAr: 'مخرطة سي إن سي',
          categoryEn: 'Lathes',
          categoryAr: 'المخارط',
          activeJobsDemand: 10,
          distinctWorkersSupply: 5,
          supplyToDemandRatio: 0.5,
        },
        {
          machineId: 'm2',
          nameEn: 'Laser Cutter',
          nameAr: 'قاطع ليزر',
          categoryEn: 'Sheet Metal',
          categoryAr: 'معادن',
          activeJobsDemand: 2,
          distinctWorkersSupply: 10,
          supplyToDemandRatio: 5.0,
        },
      ]);

      const res = await service.getMachineryMetrics();

      expect(res.machines[0].marketStatus).toBe('SHORTAGE'); // 0.5 < 1.0
      expect(res.machines[1].marketStatus).toBe('SURPLUS'); // 5.0 > 3.0
    });
  });
});
