/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmAnalyticsReadRepository } from './typeorm-analytics-read.repo';
import { UserOrmEntity } from '@/features/users/infrastructure/user.orm-entity';
import { JobOrmEntity } from '@/features/jobs/infrastructure/job.orm-entity';
import { SubscriptionOrmEntity } from '@/features/billing/infrastructure/subscription.orm-entity';
import { JobApplicationOrmEntity } from '@/features/applications/infrastructure/job-application.orm-entity';
import { MachineOrmEntity } from '@/features/machines/infrastructure/machine.orm-entity';
import { JobStatus } from '@/features/jobs/domain/job-status.enum';
import { UserType } from '@/features/users/domain/user-type.enum';

describe('TypeOrmAnalyticsReadRepository', () => {
  let repo: TypeOrmAnalyticsReadRepository;

  const mockUserRepo = {
    query: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockJobRepo = {
    createQueryBuilder: jest.fn(),
  };

  const mockSubRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAppRepo = {
    createQueryBuilder: jest.fn(),
  };

  const mockMachineRepo = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmAnalyticsReadRepository,
        { provide: getRepositoryToken(UserOrmEntity), useValue: mockUserRepo },
        { provide: getRepositoryToken(JobOrmEntity), useValue: mockJobRepo },
        {
          provide: getRepositoryToken(SubscriptionOrmEntity),
          useValue: mockSubRepo,
        },
        {
          provide: getRepositoryToken(JobApplicationOrmEntity),
          useValue: mockAppRepo,
        },
        {
          provide: getRepositoryToken(MachineOrmEntity),
          useValue: mockMachineRepo,
        },
      ],
    }).compile();

    repo = module.get<TypeOrmAnalyticsReadRepository>(
      TypeOrmAnalyticsReadRepository,
    );
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should execute active job count with published status and defensive expiresAt check', async () => {
    const mockQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(18),
    };
    mockJobRepo.createQueryBuilder.mockReturnValue(mockQb);

    const count = await repo.getPlatformActiveJobCount();

    expect(count).toBe(18);
    expect(mockQb.where).toHaveBeenCalledWith('job.status = :status', {
      status: JobStatus.PUBLISHED,
    });
    expect(mockQb.andWhere).toHaveBeenCalledWith(
      'job.expiresAt > :now',
      expect.objectContaining({ now: expect.any(Date) }),
    );
  });

  it('should map distinct workers and jobs demand with safe ratio', async () => {
    mockMachineRepo.query.mockResolvedValue([
      {
        machineId: 'm1',
        nameEn: 'Laser CNC',
        nameAr: 'ليزر',
        categoryEn: 'Cutting',
        categoryAr: 'قطع',
        activeJobsDemand: 4,
        distinctWorkersSupply: 8,
      },
      {
        machineId: 'm2',
        nameEn: 'Boring Mill',
        nameAr: 'مخرطة ثقب',
        categoryEn: 'Heavy',
        categoryAr: 'ثقيل',
        activeJobsDemand: 0,
        distinctWorkersSupply: 2,
      },
    ]);

    const result = await repo.getMachinerySupplyAndDemand(5);

    expect(result).toHaveLength(2);
    expect(result[0].supplyToDemandRatio).toBe(2.0); // 8 / 4
    expect(result[1].supplyToDemandRatio).toBeNull(); // 0 demand -> null ratio
  });

  it('should exclude PLATFORM_ADMIN in getPlatformUserGrowthTimeSeries SQL query', async () => {
    mockUserRepo.query.mockResolvedValue([
      { date: '2026-11-01', candidates: '2', employers: '1', total: '3' },
    ]);

    const start = new Date('2026-11-01T00:00:00Z');
    const end = new Date('2026-11-05T00:00:00Z');

    const result = await repo.getPlatformUserGrowthTimeSeries(start, end, 'day');

    expect(result).toEqual([
      { date: '2026-11-01', candidates: 2, employers: 1, total: 3 },
    ]);
    expect(mockUserRepo.query).toHaveBeenCalledWith(
      expect.stringContaining(`AND "userType" != 'PLATFORM_ADMIN'`),
      expect.any(Array),
    );
  });

  it('should exclude PLATFORM_ADMIN in getPlatformUserCounts query builder', async () => {
    const mockQb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        total: '10',
        candidates: '7',
        employers: '3',
      }),
    };
    mockUserRepo.createQueryBuilder.mockReturnValue(mockQb);

    const start = new Date('2026-10-01T00:00:00Z');
    const end = new Date('2026-11-01T00:00:00Z');

    const counts = await repo.getPlatformUserCounts(start, end);

    expect(counts).toEqual({ total: 10, candidates: 7, employers: 3 });
    expect(mockQb.where).toHaveBeenCalledWith('user.userType != :adminType', {
      adminType: UserType.PLATFORM_ADMIN,
    });
    expect(mockQb.andWhere).toHaveBeenCalledWith(
      'user.createdAt >= :start AND user.createdAt < :end',
      { start, end },
    );
  });

  it('should exclude PLATFORM_ADMIN in getPlatformEarliestRecordDate query builder', async () => {
    const mockQb = {
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ minDate: '2026-01-15T00:00:00Z' }),
    };
    mockUserRepo.createQueryBuilder.mockReturnValue(mockQb);

    const earliest = await repo.getPlatformEarliestRecordDate();

    expect(earliest).toEqual(new Date('2026-01-15T00:00:00Z'));
    expect(mockQb.where).toHaveBeenCalledWith('user.userType != :adminType', {
      adminType: UserType.PLATFORM_ADMIN,
    });
  });
});
