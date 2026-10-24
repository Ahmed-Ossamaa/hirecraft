/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { ApplicationsService } from '../applications/applications.service';
import { SubscriptionLimitsService } from '../billing/subscription-limits/subscription-limits.service';
import { DataSource } from 'typeorm';
import { JobStatus } from './domain/job-status.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExperienceLevel } from './domain/exp-level.enum';
import { JOB_REPOSITORY } from './domain/job.repo.interface';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepoMock: any;
  let applicationsServiceMock: any;
  let subscriptionLimitsServiceMock: any;
  let dataSourceMock: any;

  beforeEach(async () => {
    jobRepoMock = {
      create: jest
        .fn()
        .mockImplementation((params) =>
          Promise.resolve({ id: 'job-1', ...params }),
        ),
      findById: jest.fn(),
      findByCompanyId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateReturning: jest.fn(),
      delete: jest.fn(),
      closeExcessActiveJobs: jest.fn().mockResolvedValue(2),
      closeExpiredJobs: jest.fn().mockResolvedValue(1),
    };

    applicationsServiceMock = {
      getCountsForJobs: jest.fn().mockResolvedValue(new Map()),
    };

    subscriptionLimitsServiceMock = {
      lockCompany: jest.fn().mockResolvedValue(undefined),
      checkActiveJobLimit: jest.fn().mockResolvedValue(undefined),
      checkJobPostingLimit: jest.fn().mockResolvedValue(undefined),
      recordJobPostingUsage: jest.fn().mockResolvedValue(undefined),
    };

    dataSourceMock = {
      transaction: jest.fn().mockImplementation((cb) => cb({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: JOB_REPOSITORY,
          useValue: jobRepoMock,
        },
        {
          provide: ApplicationsService,
          useValue: applicationsServiceMock,
        },
        {
          provide: SubscriptionLimitsService,
          useValue: subscriptionLimitsServiceMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob (Option A: strictly creates DRAFT)', () => {
    it('should always create job with DRAFT status and null timestamps even if status is passed', async () => {
      const result = await service.createJob({
        companyId: 'company-1',
        authorId: 'user-1',
        title: 'Technician',
        description: 'Details',
        machineCategoryId: 'cat-1',
        machineId: 'mach-1',
        country: 'Egypt',
        city: 'Cairo',
        experienceLevel: ExperienceLevel.SENIOR,
        status: JobStatus.PUBLISHED, // Attempt to create as published
      });

      expect(jobRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: JobStatus.DRAFT,
          publishedAt: null,
          expiresAt: null,
        }),
      );
      expect(result.status).toBe(JobStatus.DRAFT);
    });
  });

  describe('updateJob (content only)', () => {
    it('should update content fields and strip any status parameters', async () => {
      jobRepoMock.updateReturning.mockResolvedValue({
        id: 'job-1',
        title: 'Updated Title',
      });

      const result = await service.updateJob('job-1', 'company-1', {
        title: 'Updated Title',
        status: JobStatus.PUBLISHED, // Should be stripped
      });

      expect(jobRepoMock.updateReturning).toHaveBeenCalledWith(
        'job-1',
        { title: 'Updated Title' },
        'company-1',
      );
      expect(subscriptionLimitsServiceMock.lockCompany).not.toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if job not found or wrong company', async () => {
      jobRepoMock.updateReturning.mockResolvedValue(null);

      await expect(
        service.updateJob('job-1', 'company-1', { title: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateJobStatus (lifecycle transitions)', () => {
    it('should throw ForbiddenException if company attempts to set status to CLOSED', async () => {
      await expect(
        service.updateJobStatus('job-1', 'company-1', JobStatus.CLOSED),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should lock company, check limits, set timestamps, and record usage when publishing', async () => {
      jobRepoMock.findById.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        status: JobStatus.DRAFT,
      });
      jobRepoMock.updateReturning.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.PUBLISHED,
      });

      const result = await service.updateJobStatus(
        'job-1',
        'company-1',
        JobStatus.PUBLISHED,
      );

      expect(subscriptionLimitsServiceMock.lockCompany).toHaveBeenCalledWith(
        'company-1',
        expect.anything(),
      );
      expect(
        subscriptionLimitsServiceMock.checkActiveJobLimit,
      ).toHaveBeenCalledWith('company-1', expect.anything());
      expect(
        subscriptionLimitsServiceMock.checkJobPostingLimit,
      ).toHaveBeenCalledWith('company-1', expect.anything());
      expect(jobRepoMock.updateReturning).toHaveBeenCalledWith(
        'job-1',
        expect.objectContaining({
          status: JobStatus.PUBLISHED,
          publishedAt: expect.any(Date),
          expiresAt: expect.any(Date),
        }),
        'company-1',
        expect.anything(),
      );
      expect(
        subscriptionLimitsServiceMock.recordJobPostingUsage,
      ).toHaveBeenCalledWith('company-1', 'job-1', expect.anything());
      expect(result.status).toBe(JobStatus.PUBLISHED);
    });

    it('should update to DRAFT without consuming credits or locking company', async () => {
      jobRepoMock.findById.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        status: JobStatus.PUBLISHED,
      });
      jobRepoMock.updateReturning.mockResolvedValue({
        id: 'job-1',
        status: JobStatus.DRAFT,
      });

      const result = await service.updateJobStatus(
        'job-1',
        'company-1',
        JobStatus.DRAFT,
      );

      expect(subscriptionLimitsServiceMock.lockCompany).not.toHaveBeenCalled();
      expect(
        subscriptionLimitsServiceMock.recordJobPostingUsage,
      ).not.toHaveBeenCalled();
      expect(jobRepoMock.updateReturning).toHaveBeenCalledWith(
        'job-1',
        { status: JobStatus.DRAFT },
        'company-1',
        expect.anything(),
      );
      expect(result.status).toBe(JobStatus.DRAFT);
    });

    it('should return existing job immediately if already in target status', async () => {
      jobRepoMock.findById.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        status: JobStatus.PUBLISHED,
      });

      const result = await service.updateJobStatus(
        'job-1',
        'company-1',
        JobStatus.PUBLISHED,
      );

      expect(jobRepoMock.updateReturning).not.toHaveBeenCalled();
      expect(result.status).toBe(JobStatus.PUBLISHED);
    });
  });
});
