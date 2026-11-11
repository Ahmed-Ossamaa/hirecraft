import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsersService } from '@/features/users/users.service';
import { CompaniesService } from '@/features/companies/companies.service';
import { CompanyMembersService } from '@/features/company-members/company-members.service';
import { WorkerProfilesService } from '@/features/worker-profiles/worker-profiles.service';
import { JobsService } from '@/features/jobs/jobs.service';
import { SubscriptionsService } from '@/features/billing/services/subscriptions.service';
import { PlansService } from '@/features/plans/services/plans.service';
import { MachinesService } from '@/features/machines/machines.service';
import { MachineCategoriesService } from '@/features/machine-categories/machine-categories.service';

import { AdminUsersQueryDto } from '../dto/admin-users-query.dto';
import { AdminCompaniesQueryDto } from '../dto/admin-companies-query.dto';
import { AdminJobsQueryDto } from '../dto/admin-jobs-query.dto';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let companiesService: jest.Mocked<Partial<CompaniesService>>;
  let companyMembersService: jest.Mocked<Partial<CompanyMembersService>>;
  let workerProfilesService: jest.Mocked<Partial<WorkerProfilesService>>;
  let jobsService: jest.Mocked<Partial<JobsService>>;
  let subscriptionsService: jest.Mocked<Partial<SubscriptionsService>>;
  let plansService: jest.Mocked<Partial<PlansService>>;
  let machinesService: jest.Mocked<Partial<MachinesService>>;
  let machineCategoriesService: jest.Mocked<Partial<MachineCategoriesService>>;

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

    companyMembersService = {
      findCompanyNamesByUserIds: jest.fn().mockResolvedValue(new Map()),
      findCompanyDetailsByUserIds: jest.fn().mockResolvedValue(new Map()),
      countActiveMembersByCompanyId: jest.fn().mockResolvedValue(3),
      countActiveMembersByCompanyIds: jest.fn().mockResolvedValue(new Map()),
      getMembers: jest.fn().mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }),
    };

    workerProfilesService = {
      findProfileIdsByUserIds: jest.fn().mockResolvedValue(new Map()),
    };

    jobsService = {
      countJobsByCompanyIds: jest.fn().mockResolvedValue(new Map()),
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
      getActivePlansByCompanyIds: jest.fn().mockResolvedValue(new Map()),
    };

    plansService = {
      getPlans: jest.fn().mockReturnValue([]),
    };

    machinesService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    machineCategoriesService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsersService, useValue: usersService },
        { provide: CompaniesService, useValue: companiesService },
        { provide: CompanyMembersService, useValue: companyMembersService },
        { provide: WorkerProfilesService, useValue: workerProfilesService },
        { provide: JobsService, useValue: jobsService },
        { provide: SubscriptionsService, useValue: subscriptionsService },
        { provide: PlansService, useValue: plansService },
        { provide: MachinesService, useValue: machinesService },
        {
          provide: MachineCategoriesService,
          useValue: machineCategoriesService,
        },
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

  it('should delegate machine catalog mutations to their feature services', async () => {
    const machineDto = {
      nameEn: 'Press',
      nameAr: 'مطبعة',
      categoryId: 'cat-1',
    };
    const categoryDto = { nameEn: 'Printing', nameAr: 'طباعة' };

    await service.createMachine(machineDto);
    await service.updateMachine('machine-1', machineDto);
    await service.deleteMachine('machine-1');
    await service.createMachineCategory(categoryDto);
    await service.updateMachineCategory('category-1', categoryDto);
    await service.deleteMachineCategory('category-1');

    expect(machinesService.create).toHaveBeenCalledWith(machineDto);
    expect(machinesService.update).toHaveBeenCalledWith(
      'machine-1',
      machineDto,
    );
    expect(machinesService.delete).toHaveBeenCalledWith('machine-1');
    expect(machineCategoriesService.create).toHaveBeenCalledWith(categoryDto);
    expect(machineCategoriesService.update).toHaveBeenCalledWith(
      'category-1',
      categoryDto,
    );
    expect(machineCategoriesService.delete).toHaveBeenCalledWith('category-1');
  });
});
