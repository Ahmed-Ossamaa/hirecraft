/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { SUBSCRIPTION_REPOSITORY } from '../domain/subscription.repo.interface';
import { CompaniesService } from '@/features/companies/companies.service';
import { CompanyMembersService } from '@/features/company-members/company-members.service';
import { DataSource } from 'typeorm';
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
} from '@/integrations/payment/domain/payment-provider.interface';
import { SubscriptionStatus } from '../domain/subscription-status.enum';
import { PlansService } from '@/features/plans/services/plans.service';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let paymentProvider: jest.Mocked<PaymentProvider>;
  let subscriptionRepo: any;
  let companiesService: any;
  let companyMembersService: any;
  let dataSource: any;
  let plansService: jest.Mocked<PlansService>;
  let eventEmitter: any;
  let queryRunner: any;

  beforeEach(async () => {
    paymentProvider = {
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      retrieveSubscription: jest.fn(),
      retrieveCheckoutSession: jest.fn(),
      cancelSubscriptionAtPeriodEnd: jest.fn(),
      upgradeSubscription: jest.fn(),
      scheduleDowngrade: jest.fn(),
      verifyWebhook: jest.fn(),
      getPrices: jest.fn(),
    };

    subscriptionRepo = {
      findOneByCompanyIdAndStatus: jest.fn(),
      findOneByProviderSubId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    companiesService = {
      getCompanyById: jest.fn(),
      updatePaymentCustomerIdIfNull: jest.fn().mockResolvedValue(true),
    };

    companyMembersService = {
      checkMembership: jest.fn(),
      getActiveAdmin: jest.fn(),
    };

    plansService = {
      getPlanById: jest.fn(),
      getPlanByPaymentPriceId: jest.fn(),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    };

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
        }),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: subscriptionRepo,
        },
        {
          provide: CompaniesService,
          useValue: companiesService,
        },
        {
          provide: CompanyMembersService,
          useValue: companyMembersService,
        },
        { provide: DataSource, useValue: dataSource },
        { provide: PlansService, useValue: plansService },
        { provide: PAYMENT_PROVIDER, useValue: paymentProvider },
        { provide: EventEmitter2, useValue: eventEmitter },
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

      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Test Company',
      });
      companyMembersService.checkMembership.mockResolvedValue({
        userId: 'user_1',
        companyId: 'comp_1',
        role: CompanyRole.STAFF,
      });

      await expect(
        service.createCheckoutSession('comp_1', PlanId.PRO_MONTHLY, 'user_1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('invalid plan is rejected', async () => {
      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Test Company',
      });
      companyMembersService.checkMembership.mockResolvedValue({
        userId: 'user_1',
        companyId: 'comp_1',
        role: CompanyRole.ADMIN,
      });

      plansService.getPlanById.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(
        service.createCheckoutSession(
          'comp_1',
          'invalid_price' as PlanId,
          'user_1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('free plan is rejected', async () => {
      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Test Company',
      });
      companyMembersService.checkMembership.mockResolvedValue({
        userId: 'user_1',
        companyId: 'comp_1',
        role: CompanyRole.ADMIN,
      });

      plansService.getPlanById.mockReturnValue({
        isFree: true,
        paymentPriceId: null,
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

      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Test Company',
        paymentCustomerId: 'cus_123',
      });
      companyMembersService.checkMembership.mockResolvedValue({
        userId: 'user_1',
        companyId: 'comp_1',
        role: CompanyRole.ADMIN,
        user: { email: 'admin@test.com' },
      });
      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(null);
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

  describe('changeSubscriptionPlan', () => {
    const adminUser = {
      userId: 'user_admin',
      companyId: 'comp_1',
      role: CompanyRole.ADMIN,
      user: {
        email: 'admin@company.com',
        firstName: 'Admin',
        lastName: 'User',
      },
    };

    const companyData = {
      id: 'comp_1',
      name: 'Acme Corp',
      paymentCustomerId: 'cus_acme',
      createdAt: new Date('2026-01-01'),
    };

    const starterPlan = {
      id: PlanId.STARTER_MONTHLY,
      name: 'Starter Monthly',
      tierLevel: 1,
      interval: 'month',
      isFree: false,
      paymentPriceId: 'price_starter_123',
    };

    const proPlan = {
      id: PlanId.PRO_MONTHLY,
      name: 'Pro Monthly',
      tierLevel: 2,
      interval: 'month',
      isFree: false,
      paymentPriceId: 'price_pro_123',
    };

    const freePlan = {
      id: PlanId.FREE_MONTHLY,
      name: 'Free Monthly',
      tierLevel: 0,
      interval: 'month',
      isFree: true,
      paymentPriceId: null,
    };

    it('immediate upgrade charges full price, resets cycle to now, and saves updated plan', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);
      companyMembersService.checkMembership.mockResolvedValue(adminUser);
      companyMembersService.getActiveAdmin.mockResolvedValue(adminUser);

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
        currentPeriodStart: new Date('2026-10-01'),
        currentPeriodEnd: new Date('2026-11-01'),
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      subscriptionRepo.save.mockImplementation(async (sub: any) => sub);

      plansService.getPlanById.mockImplementation((id: PlanId) => {
        if (id === PlanId.STARTER_MONTHLY) return starterPlan as any;
        if (id === PlanId.PRO_MONTHLY) return proPlan as any;
        return freePlan as any;
      });

      const newStart = new Date('2026-10-23');
      const newEnd = new Date('2026-11-23');
      paymentProvider.upgradeSubscription.mockResolvedValue({
        id: 'sub_stripe_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.ACTIVE,
        currentPeriodStart: newStart,
        currentPeriodEnd: newEnd,
        cancelAtPeriodEnd: false,
        priceId: 'price_pro_123',
      });

      const result = await service.changeSubscriptionPlan(
        'comp_1',
        PlanId.PRO_MONTHLY,
        'user_admin',
      );

      expect(paymentProvider.upgradeSubscription).toHaveBeenCalledWith(
        'sub_stripe_1',
        'price_pro_123',
      );
      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: PlanId.PRO_MONTHLY,
          scheduledPlanId: null,
          currentPeriodStart: newStart,
          currentPeriodEnd: newEnd,
          cancelAtPeriodEnd: false,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.created',
        expect.anything(),
      );
      expect(result.action).toBe('UPGRADED');
      expect(result.subscription?.planId).toBe(PlanId.PRO_MONTHLY);
    });

    it('scheduled downgrade keeps current tier and sets scheduledPlanId for period end', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);
      companyMembersService.checkMembership.mockResolvedValue(adminUser);

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
        currentPeriodStart: new Date('2026-10-01'),
        currentPeriodEnd: new Date('2026-11-01'),
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      subscriptionRepo.save.mockImplementation(async (sub: any) => sub);

      plansService.getPlanById.mockImplementation((id: PlanId) => {
        if (id === PlanId.PRO_MONTHLY) return proPlan as any;
        if (id === PlanId.STARTER_MONTHLY) return starterPlan as any;
        return freePlan as any;
      });

      paymentProvider.scheduleDowngrade.mockResolvedValue(undefined as any);

      const result = await service.changeSubscriptionPlan(
        'comp_1',
        PlanId.STARTER_MONTHLY,
        'user_admin',
      );

      expect(paymentProvider.scheduleDowngrade).toHaveBeenCalledWith(
        'sub_stripe_1',
        'price_starter_123',
      );
      expect(paymentProvider.upgradeSubscription).not.toHaveBeenCalled();
      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: PlanId.PRO_MONTHLY,
          scheduledPlanId: PlanId.STARTER_MONTHLY,
        }),
      );
      expect(result.action).toBe('DOWNGRADE_SCHEDULED');
      expect(result.subscription?.planId).toBe(PlanId.PRO_MONTHLY);
      expect(result.subscription?.scheduledPlanId).toBe(PlanId.STARTER_MONTHLY);
    });

    it('downgrade to Free schedules cancellation at period end', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);
      companyMembersService.checkMembership.mockResolvedValue(adminUser);

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
        currentPeriodStart: new Date('2026-10-01'),
        currentPeriodEnd: new Date('2026-11-01'),
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      subscriptionRepo.save.mockImplementation(async (sub: any) => sub);

      plansService.getPlanById.mockImplementation((id: PlanId) => {
        if (id === PlanId.PRO_MONTHLY) return proPlan as any;
        return freePlan as any;
      });

      paymentProvider.cancelSubscriptionAtPeriodEnd.mockResolvedValue(
        undefined as any,
      );

      const result = await service.changeSubscriptionPlan(
        'comp_1',
        PlanId.FREE_MONTHLY,
        'user_admin',
      );

      expect(
        paymentProvider.cancelSubscriptionAtPeriodEnd,
      ).toHaveBeenCalledWith('sub_stripe_1');
      expect(result.action).toBe('DOWNGRADE_SCHEDULED');
      expect(activeSub.cancelAtPeriodEnd).toBe(true);
    });

    it('changing plan from Free tier creates checkout session', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);
      companyMembersService.checkMembership.mockResolvedValue(adminUser);
      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(null);

      plansService.getPlanById.mockReturnValue(proPlan as any);
      paymentProvider.createCheckoutSession.mockResolvedValue({
        url: 'http://checkout.stripe.com/new',
      });

      const result = await service.changeSubscriptionPlan(
        'comp_1',
        PlanId.PRO_MONTHLY,
        'user_admin',
      );

      expect(result.action).toBe('CHECKOUT');
      expect(result.url).toBe('http://checkout.stripe.com/new');
    });

    it('requesting already active plan throws BadRequestException', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);
      companyMembersService.checkMembership.mockResolvedValue(adminUser);

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
        scheduledPlanId: null,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      plansService.getPlanById.mockReturnValue(proPlan as any);

      await expect(
        service.changeSubscriptionPlan(
          'comp_1',
          PlanId.PRO_MONTHLY,
          'user_admin',
        ),
      ).rejects.toThrow(BadRequestException);
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
    });

    it('missing Stripe subscription price fails explicitly', async () => {
      const processedRepo = { insert: jest.fn().mockResolvedValue(true) };
      queryRunner.manager.getRepository.mockImplementation((entity: any) => {
        if (entity.name === 'ProcessedWebhookOrmEntity') return processedRepo;
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

      subscriptionRepo.findOneByProviderSubId.mockResolvedValue({
        id: 'sub_2',
        companyId: 'comp_2',
      });

      await expect(service.handlePaymentWebhook(event)).rejects.toThrow(
        BadRequestException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
