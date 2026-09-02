import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsersService } from '@/features/users/users.service';
import { CompaniesService } from '@/features/companies/companies.service';
import { JobsService } from '@/features/jobs/jobs.service';
import { SubscriptionsService } from '@/features/billing/subscriptions.service';
import { PlansService } from '@/features/plans/services/plans.service';

import { AdminUsersQueryDto } from '../dto/admin-users-query.dto';
import { AdminCompaniesQueryDto } from '../dto/admin-companies-query.dto';
import { AdminJobsQueryDto } from '../dto/admin-jobs-query.dto';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let companiesService: jest.Mocked<Partial<CompaniesService>>;
  let jobsService: jest.Mocked<Partial<JobsService>>;
  let subscriptionsService: jest.Mocked<Partial<SubscriptionsService>>;
  let plansService: jest.Mocked<Partial<PlansService>>;

  beforeEach(async () => {
    usersService = {
      findAllUsers: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
      findById: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
      banUser: jest.fn().mockResolvedValue(undefined),
    };

    companiesService = {
      findAllCompanies: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
      getCompanyById: jest
        .fn()
        .mockResolvedValue({ id: 'comp-1', name: 'Acme' }),
    };

    jobsService = {
      findAllJobs: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
      getJobById: jest
        .fn()
        .mockResolvedValue({ id: 'job-1', title: 'Developer' }),
      adminUpdateJobStatus: jest
        .fn()
        .mockResolvedValue({ id: 'job-1', status: 'PUBLISHED' }),
      adminDeleteJob: jest.fn().mockResolvedValue(undefined),
    };

    subscriptionsService = {
      findSubscriptions: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    };

    plansService = {
      getPlans: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsersService, useValue: usersService },
        { provide: CompaniesService, useValue: companiesService },
        { provide: JobsService, useValue: jobsService },
        { provide: SubscriptionsService, useValue: subscriptionsService },
        { provide: PlansService, useValue: plansService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate getUsers to usersService.findAllUsers', async () => {
    const query = Object.assign(new AdminUsersQueryDto(), {
      page: 1,
      limit: 10,
    });
    const res = await service.getUsers(query);
    expect(usersService.findAllUsers).toHaveBeenCalled();
    expect(res.data).toEqual([]);
  });

  it('should delegate getCompanies to companiesService.findAllCompanies', async () => {
    const query = Object.assign(new AdminCompaniesQueryDto(), {
      page: 1,
      limit: 10,
    });
    const res = await service.getCompanies(query);
    expect(companiesService.findAllCompanies).toHaveBeenCalled();
    expect(res.data).toEqual([]);
  });

  it('should delegate getJobs to jobsService.findAllJobs', async () => {
    const query = Object.assign(new AdminJobsQueryDto(), {
      page: 1,
      limit: 10,
    });
    const res = await service.getJobs(query);
    expect(jobsService.findAllJobs).toHaveBeenCalled();
    expect(res.data).toEqual([]);
  });
});
