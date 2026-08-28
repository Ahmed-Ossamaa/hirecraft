/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionOrmEntity } from './infrastructure/subscription.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { DataSource, Repository } from 'typeorm';
import { CompanyRole } from '@/features/company-members/domain/company-role.enum';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  PAYMENT_PROVIDER,
  PaymentProvider,
  PaymentEventType,
  PaymentSubscriptionStatus,
} from './domain/payment-provider.interface';
import { PlansService } from '@/features/plans/services/plans.service';
import { PlanId } from '@/features/plans/domain/plan-id.enum';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let paymentProvider: jest.Mocked<PaymentProvider>;
  let subscriptionRepo: jest.Mocked<Repository<SubscriptionOrmEntity>>;
  let companyRepo: jest.Mocked<Repository<CompanyOrmEntity>>;
  let dataSource: jest.Mocked<DataSource>;
  let plansService: jest.Mocked<PlansService>;
  let queryRunner: any;

  beforeEach(async () => {
    paymentProvider = {
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      retrieveSubscription: jest.fn(),
      cancelSubscriptionAtPeriodEnd: jest.fn(),
      verifyWebhook: jest.fn(),
    };

    subscriptionRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    } as any;

    companyRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    plansService = {
      getPlanById: jest.fn(),
      getPlanByPaymentPriceId: jest.fn(),
    } as any;

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockImplementation((entity) => {
          if (entity.name === 'ProcessedWebhookOrmEntity') {
            return { insert: jest.fn() };
          }
          if (entity.name === 'SubscriptionOrmEntity') {
            return subscriptionRepo;
          }
          if (entity.name === 'CompanyOrmEntity') {
            return companyRepo;
          }
        }),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: getRepositoryToken(SubscriptionOrmEntity),
          useValue: subscriptionRepo,
        },
        {
          provide: getRepositoryToken(CompanyOrmEntity),
          useValue: companyRepo,
        },
        { provide: DataSource, useValue: dataSource },
        { provide: PlansService, useValue: plansService },
        { provide: PAYMENT_PROVIDER, useValue: paymentProvider },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('non-admin cannot create checkout', async () => {
      plansService.getPlanById.mockReturnValue({
        id: PlanId.PRO_MONTHLY,
        isFree: false,
        paymentPriceId: 'price_pro_123',
      } as any);

      companyRepo.findOne.mockResolvedValue({
        id: 'comp_1',
        members: [{ userId: 'user_1', role: CompanyRole.STAFF }],
      } as any);
      subscriptionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createCheckoutSession('comp_1', PlanId.PRO_MONTHLY, 'user_1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('invalid plan is rejected', async () => {
      plansService.getPlanById.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(
        service.createCheckoutSession('comp_1', 'invalid_price', 'user_1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('free plan is rejected', async () => {
      plansService.getPlanById.mockReturnValue({
        isFree: true,
        paymentPriceId: null,
      } as any);

      companyRepo.findOne.mockResolvedValue({
        id: 'comp_1',
        members: [{ userId: 'user_1', role: CompanyRole.ADMIN }],
      } as any);

      await expect(
        service.createCheckoutSession('comp_1', PlanId.FREE_MONTHLY, 'user_1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('same idempotency key returns/reuses the intended operation', async () => {
      plansService.getPlanById.mockReturnValue({
        id: PlanId.PRO_MONTHLY,
        isFree: false,
        paymentPriceId: 'price_pro_123',
      } as any);

      companyRepo.findOne.mockResolvedValue({
        id: 'comp_1',
        name: 'Test Company',
        paymentCustomerId: 'cus_123',
        members: [
          {
            userId: 'user_1',
            role: CompanyRole.ADMIN,
            user: { email: 'admin@test.com' },
          },
        ],
      } as any);
      subscriptionRepo.findOne.mockResolvedValue(null);
      paymentProvider.createCheckoutSession.mockResolvedValue({
        url: 'http://checkout.stripe.com/123',
      });

      const url = await service.createCheckoutSession(
        'comp_1',
        PlanId.PRO_MONTHLY,
        'user_1',
        'idem_key_123',
      );

      expect(url).toBe('http://checkout.stripe.com/123');
      expect(paymentProvider.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          idempotencyKey: 'idem_key_123',
          priceId: 'price_pro_123',
        }),
      );
    });
  });

  describe('handlePaymentWebhook', () => {
    it('duplicate webhook event is safely ignored', async () => {
      const processedRepo = {
        insert: jest.fn().mockImplementation(() => {
          const err = new Error('Unique violation');
          (err as any).code = '23505';
          return Promise.reject(err);
        }),
      };
      queryRunner.manager.getRepository.mockImplementation((entity: any) => {
        if (entity.name === 'ProcessedWebhookOrmEntity') return processedRepo;
        return {};
      });

      const event = {
        id: 'evt_dup',
        type: PaymentEventType.SUBSCRIPTION_CREATED,
        subscriptionId: 'sub_1',
      } as any;

      await service.handlePaymentWebhook(event);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      // It should not throw, meaning it returned 200 OK
    });

    it('missing Stripe subscription price fails explicitly', async () => {
      const processedRepo = { insert: jest.fn().mockResolvedValue(true) };
      queryRunner.manager.getRepository.mockImplementation((entity: any) => {
        if (entity.name === 'ProcessedWebhookOrmEntity') return processedRepo;
        if (entity.name === 'SubscriptionOrmEntity') return subscriptionRepo;
        if (entity.name === 'CompanyOrmEntity') return companyRepo;
        return {};
      });

      const event = {
        id: 'evt_no_price',
        type: PaymentEventType.SUBSCRIPTION_CREATED,
        subscriptionId: 'sub_2',
      } as any;

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_2',
        customerId: 'cus_2',
        status: PaymentSubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        priceId: null, // Missing price.id!
      });

      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.PRO_MONTHLY,
      } as any);

      companyRepo.findOne.mockResolvedValue({ id: 'comp_2' } as any);
      subscriptionRepo.findOne.mockResolvedValue(null);

      await expect(service.handlePaymentWebhook(event)).rejects.toThrow(
        BadRequestException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
