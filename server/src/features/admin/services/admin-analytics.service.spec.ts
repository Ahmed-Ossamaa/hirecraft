import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminAnalyticsService } from './admin-analytics.service';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { SubscriptionOrmEntity } from '@/features/billing/infrastructure/subscription.orm-entity';

describe('AdminAnalyticsService', () => {
  let service: AdminAnalyticsService;
  let userRepoMock: { count: jest.Mock };
  let companyRepoMock: { count: jest.Mock };
  let jobRepoMock: { count: jest.Mock };
  let subRepoMock: { count: jest.Mock };

  beforeEach(async () => {
    userRepoMock = { count: jest.fn().mockResolvedValue(10) };
    companyRepoMock = { count: jest.fn().mockResolvedValue(5) };
    jobRepoMock = { count: jest.fn().mockResolvedValue(20) };
    subRepoMock = { count: jest.fn().mockResolvedValue(3) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAnalyticsService,
        { provide: getRepositoryToken(UserOrmEntity), useValue: userRepoMock },
        {
          provide: getRepositoryToken(CompanyOrmEntity),
          useValue: companyRepoMock,
        },
        { provide: getRepositoryToken(JobOrmEntity), useValue: jobRepoMock },
        {
          provide: getRepositoryToken(SubscriptionOrmEntity),
          useValue: subRepoMock,
        },
      ],
    }).compile();

    service = module.get<AdminAnalyticsService>(AdminAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return real aggregate stats from repositories', async () => {
    const stats = await service.getOverviewStats();
    expect(stats).toEqual({
      totalUsers: 10,
      totalCompanies: 5,
      activeJobs: 20,
      activeSubscriptions: 3,
    });
  });

  // it('should return placeholder  for deferred user growth metrics', async () => {
  //   const res = await service.getUserGrowthMetrics();
  //   expect(res.status).toBe('DEFERRED');
  //   expect(res.data).toBeNull();
  // });
});
