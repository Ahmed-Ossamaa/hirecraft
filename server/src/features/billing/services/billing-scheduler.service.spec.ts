/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  ScheduleModule: {
    forRoot: () => ({ module: class ScheduleModuleMock {} }),
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BillingSchedulerService } from './billing-scheduler.service';
import { JobsService } from '@/features/jobs/jobs.service';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionReconciliationService } from './subscription-reconciliation.service';
import { DataSource } from 'typeorm';
import { SubscriptionStatus } from '../domain/subscription-status.enum';
import { Subscription } from '../domain/subscription.entity';

describe('BillingSchedulerService', () => {
  let service: BillingSchedulerService;
  let jobsServiceMock: { closeExpiredJobs: jest.Mock };
  let subscriptionsServiceMock: {
    findExpiredActiveSubscriptions: jest.Mock;
    markSubscriptionExpired: jest.Mock;
  };
  let reconciliationServiceMock: {
    reconcileCompanyResources: jest.Mock;
  };
  let dataSourceMock: {
    transaction: jest.Mock;
  };

  beforeEach(async () => {
    jobsServiceMock = {
      closeExpiredJobs: jest.fn().mockResolvedValue(3),
    };

    subscriptionsServiceMock = {
      findExpiredActiveSubscriptions: jest.fn().mockResolvedValue([]),
      markSubscriptionExpired: jest.fn().mockResolvedValue({}),
    };

    reconciliationServiceMock = {
      reconcileCompanyResources: jest.fn().mockResolvedValue({
        closedJobs: 1,
        revokedPending: 0,
        deactivatedActive: 1,
      }),
    };

    dataSourceMock = {
      transaction: jest.fn(async (cb) => {
        const fakeTx = {};
        return cb(fakeTx);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingSchedulerService,
        { provide: JobsService, useValue: jobsServiceMock },
        { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
        {
          provide: SubscriptionReconciliationService,
          useValue: reconciliationServiceMock,
        },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<BillingSchedulerService>(BillingSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runDailySweep', () => {
    it('closes expired jobs and sweeps expired subscriptions', async () => {
      const now = new Date('2026-10-22T00:00:00Z');
      const expiredSub1 = new Subscription();
      expiredSub1.id = 'sub-1';
      expiredSub1.companyId = 'company-1';
      expiredSub1.status = SubscriptionStatus.ACTIVE;
      expiredSub1.currentPeriodEnd = new Date('2026-10-21T23:59:59Z');

      const expiredSub2 = new Subscription();
      expiredSub2.id = 'sub-2';
      expiredSub2.companyId = 'company-2';
      expiredSub2.status = SubscriptionStatus.ACTIVE;
      expiredSub2.currentPeriodEnd = new Date('2026-10-21T12:00:00Z');

      subscriptionsServiceMock.findExpiredActiveSubscriptions.mockResolvedValue(
        [expiredSub1, expiredSub2],
      );

      const result = await service.runDailySweep(now);

      expect(jobsServiceMock.closeExpiredJobs).toHaveBeenCalledWith(now);
      expect(
        subscriptionsServiceMock.findExpiredActiveSubscriptions,
      ).toHaveBeenCalledWith(now);

      expect(dataSourceMock.transaction).toHaveBeenCalledTimes(2);
      expect(
        subscriptionsServiceMock.markSubscriptionExpired,
      ).toHaveBeenCalledTimes(2);
      expect(
        reconciliationServiceMock.reconcileCompanyResources,
      ).toHaveBeenCalledWith('company-1', expect.anything());
      expect(
        reconciliationServiceMock.reconcileCompanyResources,
      ).toHaveBeenCalledWith('company-2', expect.anything());

      expect(result).toEqual({
        closedJobs: 3,
        reconciledSubscriptions: 2,
      });
    });

    it('continues reconciling remaining subscriptions if one subscription reconciliation fails', async () => {
      const now = new Date();
      const subFail = new Subscription();
      subFail.id = 'sub-fail';
      subFail.companyId = 'company-fail';

      const subSuccess = new Subscription();
      subSuccess.id = 'sub-success';
      subSuccess.companyId = 'company-success';

      subscriptionsServiceMock.findExpiredActiveSubscriptions.mockResolvedValue(
        [subFail, subSuccess],
      );

      reconciliationServiceMock.reconcileCompanyResources.mockImplementation(
        (companyId: string) => {
          if (companyId === 'company-fail') {
            throw new Error('Database deadlock on company-fail');
          }
          return Promise.resolve({
            closedJobs: 0,
            revokedPending: 0,
            deactivatedActive: 0,
          });
        },
      );

      const result = await service.runDailySweep(now);

      expect(result.closedJobs).toBe(3);
      expect(result.reconciledSubscriptions).toBe(1);
    });
  });
});
