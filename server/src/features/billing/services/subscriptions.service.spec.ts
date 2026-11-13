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
import { DataSource } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
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
import {
  SubscriptionCreatedEvent,
  SubscriptionCancellationScheduledEvent,
  SubscriptionDowngradeScheduledEvent,
  SubscriptionExpiredEvent,
} from '@/integrations/mail/mail.events';

import { JOB_POSTING_USAGE_REPOSITORY } from '../domain/job-posting-usage.repo.interface';
import { JOB_REPOSITORY } from '@/features/jobs/domain/job.repo.interface';
import { COMPANY_MEMBER_REPOSITORY } from '@/features/company-members/domain/company-member.repo.interface';
import { PROCESSED_WEBHOOK_REPOSITORY } from '../domain/processed-webhook.repo.interface';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let paymentProvider: jest.Mocked<PaymentProvider>;
  let subscriptionRepo: any;
  let processedWebhookRepo: any;
  let companiesService: any;
  let dataSource: any;
  let plansService: jest.Mocked<PlansService>;
  let eventEmitter: any;

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
      findActiveOrPastDueByCompanyId: jest.fn().mockResolvedValue(null),
      findActiveAndPastDueProviderSubscriptions: jest
        .fn()
        .mockResolvedValue([]),
      findOneByProviderSubId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    processedWebhookRepo = {
      tryRecordEvent: jest.fn().mockResolvedValue(true),
    };

    companiesService = {
      getCompanyById: jest.fn().mockResolvedValue(null),
      updatePaymentCustomerIdIfNull: jest.fn().mockResolvedValue(true),
    };

    plansService = {
      getPlanById: jest.fn(),
      getPlanByPaymentPriceId: jest.fn(),
      getPlansWithPrices: jest.fn().mockResolvedValue([]),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
    };

    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(async (cb: (tx: any) => Promise<any>) => {
          return cb({});
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: subscriptionRepo,
        },
        {
          provide: PROCESSED_WEBHOOK_REPOSITORY,
          useValue: processedWebhookRepo,
        },
        {
          provide: CompaniesService,
          useValue: companiesService,
        },
        { provide: DataSource, useValue: dataSource },
        { provide: PlansService, useValue: plansService },
        { provide: PAYMENT_PROVIDER, useValue: paymentProvider },
        { provide: EventEmitter2, useValue: eventEmitter },
        {
          provide: JOB_POSTING_USAGE_REPOSITORY,
          useValue: {
            countUsage: jest.fn().mockResolvedValue(0),
            recordUsage: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JOB_REPOSITORY,
          useValue: {
            countPublishedActiveByCompanyId: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: COMPANY_MEMBER_REPOSITORY,
          useValue: {
            countReservedMembersByCompanyId: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('invalid plan is rejected', async () => {
      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Test Company',
      });

      plansService.getPlanById.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(
        service.createCheckoutSession('comp_1', 'invalid_price' as PlanId),
      ).rejects.toThrow(NotFoundException);
    });

    it('free plan is rejected', async () => {
      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Test Company',
      });

      plansService.getPlanById.mockReturnValue({
        isFree: true,
        paymentPriceId: null,
      } as any);

      await expect(
        service.createCheckoutSession('comp_1', PlanId.FREE_MONTHLY),
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
      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(null);
      paymentProvider.createCheckoutSession.mockResolvedValue({
        url: 'http://checkout.stripe.com/123',
      });

      const url = await service.createCheckoutSession(
        'comp_1',
        PlanId.PRO_MONTHLY,
        'admin@test.com',
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

    it('throws ConflictException (409) if company already has an active or past-due subscription', async () => {
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValueOnce({
        id: 'sub_active_123',
        companyId: 'comp_1',
        status: SubscriptionStatus.PAST_DUE,
      });

      await expect(
        service.createCheckoutSession('comp_1', PlanId.PRO_MONTHLY),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('changeSubscriptionPlan', () => {
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

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
        currentPeriodStart: new Date('2026-11-01'),
        currentPeriodEnd: new Date('2026-12-01'),
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValue(
        activeSub,
      );
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
        'admin@company.com',
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
        new SubscriptionCreatedEvent(
          'admin@company.com',
          'Acme Corp',
          'Pro Monthly',
          newEnd,
          'Acme Corp',
        ),
      );
      expect(result.action).toBe('UPGRADED');
      expect(result.subscription?.planId).toBe(PlanId.PRO_MONTHLY);
    });

    it('throws BadRequestException if payment provider returns non-active status on upgrade', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      plansService.getPlanById.mockImplementation((id: PlanId) => {
        if (id === PlanId.STARTER_MONTHLY) return starterPlan as any;
        if (id === PlanId.PRO_MONTHLY) return proPlan as any;
        return freePlan as any;
      });

      paymentProvider.upgradeSubscription.mockResolvedValue({
        id: 'sub_stripe_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.PAST_DUE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        priceId: 'price_pro_123',
      });

      await expect(
        service.changeSubscriptionPlan('comp_1', PlanId.PRO_MONTHLY),
      ).rejects.toThrow(BadRequestException);
    });

    it('scheduled downgrade keeps current tier and sets scheduledPlanId for period end', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
        currentPeriodStart: new Date('2026-11-01'),
        currentPeriodEnd: new Date('2026-12-01'),
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValue(
        activeSub,
      );
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
        'admin@company.com',
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
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.downgrade_scheduled',
        expect.any(SubscriptionDowngradeScheduledEvent),
      );
    });

    it('downgrade to Free schedules cancellation at period end', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);

      const activeSub = {
        id: 'sub_rec_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        providerSubId: 'sub_stripe_1',
        currentPeriodStart: new Date('2026-11-01'),
        currentPeriodEnd: new Date('2026-12-01'),
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValue(
        activeSub,
      );
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
        'admin@company.com',
      );

      expect(
        paymentProvider.cancelSubscriptionAtPeriodEnd,
      ).toHaveBeenCalledWith('sub_stripe_1');
      expect(result.action).toBe('DOWNGRADE_SCHEDULED');
      expect(activeSub.cancelAtPeriodEnd).toBe(true);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.cancellation_scheduled',
        expect.any(SubscriptionCancellationScheduledEvent),
      );
    });

    it('changing plan from Free tier creates checkout session', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);
      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(null);

      plansService.getPlanById.mockReturnValue(proPlan as any);
      paymentProvider.createCheckoutSession.mockResolvedValue({
        url: 'http://checkout.stripe.com/new',
      });

      const result = await service.changeSubscriptionPlan(
        'comp_1',
        PlanId.PRO_MONTHLY,
        'admin@company.com',
      );

      expect(result.action).toBe('CHECKOUT');
      expect(result.url).toBe('http://checkout.stripe.com/new');
    });

    it('requesting already active plan throws BadRequestException', async () => {
      companiesService.getCompanyById.mockResolvedValue(companyData);

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
          'admin@company.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handlePaymentWebhook', () => {
    it('duplicate webhook event is safely ignored', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(false);

      const event = {
        id: 'evt_dup',
        provider: 'stripe',
        type: PaymentEventType.SUBSCRIPTION_CREATED,
        subscriptionId: 'sub_1',
      } as any;

      await service.handlePaymentWebhook(event);

      expect(processedWebhookRepo.tryRecordEvent).toHaveBeenCalledWith(
        'stripe',
        'evt_dup',
        PaymentEventType.SUBSCRIPTION_CREATED,
        expect.anything(),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('missing Stripe subscription price fails explicitly', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(true);

      const event = {
        id: 'evt_no_price',
        provider: 'stripe',
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
    });

    it('emits subscription.reconcile immediately when webhook detects plan downgrade', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(true);

      const event = {
        id: 'evt_downgrade',
        provider: 'stripe',
        type: PaymentEventType.SUBSCRIPTION_UPDATED,
        subscriptionId: 'sub_downgrade',
      } as any;

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_downgrade',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        priceId: 'price_starter_123',
      });

      subscriptionRepo.findOneByProviderSubId.mockResolvedValue({
        id: 'sub_downgrade',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
      });

      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      plansService.getPlanById.mockReturnValue({
        id: PlanId.PRO_MONTHLY,
        name: 'Pro Monthly',
        tierLevel: 2,
        interval: 'month',
      } as any);
      plansService.getPlanById.mockImplementation((id: PlanId) =>
        id === PlanId.STARTER_MONTHLY
          ? ({
              id: PlanId.STARTER_MONTHLY,
              name: 'Starter Monthly',
              tierLevel: 1,
              interval: 'month',
              isFree: false,
              paymentPriceId: 'price_starter_123',
            } as any)
          : ({
              id: PlanId.PRO_MONTHLY,
              name: 'Pro Monthly',
              tierLevel: 2,
              interval: 'month',
              isFree: false,
              paymentPriceId: 'price_pro_123',
            } as any),
      );

      await service.handlePaymentWebhook(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.reconcile', {
        companyId: 'comp_1',
      });
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('does not treat an unrelated invoice event as a paid renewal', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(true);
      const currentPeriodStart = new Date('2026-10-01T00:00:00Z');
      const currentPeriodEnd = new Date('2026-11-01T00:00:00Z');
      const localSub = {
        id: 'sub_local_1',
        companyId: 'comp_1',
        providerSubId: 'sub_past_due_1',
        planId: PlanId.PRO_MONTHLY,
        scheduledPlanId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        amount: 3000,
        currency: 'EGP',
        billingInterval: 'month',
      };
      const event = {
        id: 'evt_old_invoice',
        provider: 'stripe',
        type: PaymentEventType.INVOICE_PAID,
        subscriptionId: 'sub_past_due_1',
        invoice: {
          id: 'in_old',
          billingReason: 'OTHER',
          periodStart: new Date('2026-09-01T00:00:00Z'),
          periodEnd: currentPeriodStart,
        },
      } as any;

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_past_due_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date('2026-11-01T00:00:00Z'),
        currentPeriodEnd: new Date('2026-12-01T00:00:00Z'),
        cancelAtPeriodEnd: false,
        priceId: 'price_starter_123',
      });
      subscriptionRepo.findOneByProviderSubId.mockResolvedValue(localSub);
      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        interval: 'month',
      } as any);
      plansService.getPlanById.mockReturnValue({
        id: PlanId.PRO_MONTHLY,
        name: 'Pro Monthly',
        interval: 'month',
        paymentPriceId: 'price_pro',
      } as any);

      await service.handlePaymentWebhook(event);

      expect(localSub).toEqual(
        expect.objectContaining({
          planId: PlanId.PRO_MONTHLY,
          scheduledPlanId: PlanId.STARTER_MONTHLY,
          status: SubscriptionStatus.PAST_DUE,
          currentPeriodStart,
          currentPeriodEnd,
        }),
      );
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'subscription.reconcile',
        expect.anything(),
      );
    });

    it('applies a scheduled plan only when invoice confirms that renewal period', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(true);
      const currentPeriodStart = new Date('2026-10-01T00:00:00Z');
      const currentPeriodEnd = new Date('2026-11-01T00:00:00Z');
      const nextPeriodEnd = new Date('2026-12-01T00:00:00Z');
      const localSub = {
        id: 'sub_local_1',
        companyId: 'comp_1',
        providerSubId: 'sub_past_due_1',
        planId: PlanId.PRO_MONTHLY,
        scheduledPlanId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        amount: 3000,
        currency: 'EGP',
        billingInterval: 'month',
      };
      const event = {
        id: 'evt_cycle_paid',
        provider: 'stripe',
        type: PaymentEventType.INVOICE_PAID,
        subscriptionId: 'sub_past_due_1',
        invoice: {
          id: 'in_cycle',
          billingReason: 'SUBSCRIPTION_CYCLE',
          periodStart: currentPeriodEnd,
          periodEnd: nextPeriodEnd,
        },
      } as any;

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_past_due_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.ACTIVE,
        currentPeriodStart: currentPeriodEnd,
        currentPeriodEnd: nextPeriodEnd,
        cancelAtPeriodEnd: false,
        priceId: 'price_starter_123',
      });
      subscriptionRepo.findOneByProviderSubId.mockResolvedValue(localSub);
      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);
      plansService.getPlanById.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
        isFree: false,
        paymentPriceId: 'price_starter_123',
      } as any);
      plansService.getPlanById.mockImplementation((id: PlanId) =>
        id === PlanId.PRO_MONTHLY
          ? ({
              id: PlanId.PRO_MONTHLY,
              name: 'Pro Monthly',
              tierLevel: 2,
              interval: 'month',
            } as any)
          : ({
              id: PlanId.STARTER_MONTHLY,
              name: 'Starter Monthly',
              tierLevel: 1,
              interval: 'month',
              isFree: false,
              paymentPriceId: 'price_starter_123',
            } as any),
      );

      await service.handlePaymentWebhook(event);

      expect(localSub).toEqual(
        expect.objectContaining({
          planId: PlanId.STARTER_MONTHLY,
          scheduledPlanId: null,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: currentPeriodEnd,
          currentPeriodEnd: nextPeriodEnd,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.reconcile', {
        companyId: 'comp_1',
      });
    });

    it('sets status to PAST_DUE on payment failure without triggering resource downgrade', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(true);

      const event = {
        id: 'evt_invoice_failed',
        provider: 'stripe',
        type: PaymentEventType.INVOICE_PAYMENT_FAILED,
        subscriptionId: 'sub_past_due_1',
      } as any;
      const currentPeriodStart = new Date('2026-10-01T00:00:00Z');
      const currentPeriodEnd = new Date('2026-11-01T00:00:00Z');

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_past_due_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.PAST_DUE,
        currentPeriodStart: new Date('2026-11-01T00:00:00Z'),
        currentPeriodEnd: new Date('2026-12-01T00:00:00Z'),
        cancelAtPeriodEnd: false,
        priceId: 'price_starter_123',
      });

      subscriptionRepo.findOneByProviderSubId.mockResolvedValue({
        id: 'sub_past_due_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
      });

      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      plansService.getPlanById.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      await service.handlePaymentWebhook(event);

      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubscriptionStatus.PAST_DUE,
          planId: PlanId.STARTER_MONTHLY,
          currentPeriodStart,
          currentPeriodEnd,
        }),
        expect.anything(),
      );
      // PAST_DUE must NOT trigger reconcile / downgrade!
      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'subscription.reconcile',
        expect.anything(),
      );
    });

    it('sets status to UNPAID and triggers reconciliation when retries exhausted', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(true);

      const event = {
        id: 'evt_unpaid_1',
        provider: 'stripe',
        type: PaymentEventType.SUBSCRIPTION_UPDATED,
        subscriptionId: 'sub_unpaid_1',
      } as any;

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_unpaid_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.UNPAID,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        priceId: 'price_starter_123',
      });

      subscriptionRepo.findOneByProviderSubId.mockResolvedValue({
        id: 'sub_unpaid_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
      });

      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      plansService.getPlanById.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      await service.handlePaymentWebhook(event);

      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubscriptionStatus.UNPAID,
        }),
        expect.anything(),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.reconcile', {
        companyId: 'comp_1',
      });
    });

    it('does not repeat reconciliation for an already-terminal subscription', async () => {
      processedWebhookRepo.tryRecordEvent.mockResolvedValue(true);

      const event = {
        id: 'evt_unpaid_repeat',
        provider: 'stripe',
        type: PaymentEventType.SUBSCRIPTION_UPDATED,
        subscriptionId: 'sub_unpaid_1',
      } as any;

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_unpaid_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.UNPAID,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        priceId: 'price_starter_123',
      });

      subscriptionRepo.findOneByProviderSubId.mockResolvedValue({
        id: 'sub_unpaid_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.UNPAID,
      });

      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      plansService.getPlanById.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      await service.handlePaymentWebhook(event);

      expect(eventEmitter.emit).not.toHaveBeenCalledWith(
        'subscription.reconcile',
        { companyId: 'comp_1' },
      );
    });
  });

  describe('reconcileProviderSubscriptions', () => {
    it('syncs live provider state and triggers reconcile for cancelled subscriptions', async () => {
      subscriptionRepo.findActiveAndPastDueProviderSubscriptions.mockResolvedValue(
        [
          {
            id: 'sub_local_1',
            companyId: 'comp_1',
            providerSubId: 'sub_stripe_1',
            provider: 'stripe',
          },
        ],
      );

      paymentProvider.retrieveSubscription.mockResolvedValue({
        id: 'sub_stripe_1',
        customerId: 'cus_acme',
        status: PaymentSubscriptionStatus.CANCELED,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: true,
        priceId: 'price_starter_123',
      });

      subscriptionRepo.findOneByProviderSubId.mockResolvedValue({
        id: 'sub_local_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
      });

      plansService.getPlanByPaymentPriceId.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      plansService.getPlanById.mockReturnValue({
        id: PlanId.STARTER_MONTHLY,
        name: 'Starter Monthly',
        tierLevel: 1,
        interval: 'month',
      } as any);

      const res = await service.reconcileProviderSubscriptions();

      expect(res.reconciledCount).toBe(1);
      expect(subscriptionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubscriptionStatus.CANCELLED,
        }),
        expect.anything(),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.reconcile', {
        companyId: 'comp_1',
      });
    });
  });

  describe('getCompanyPlan and getSubscriptionForCompany', () => {
    it('returns the free plan when no active paid subscription exists', async () => {
      const freePlan = { id: PlanId.FREE_MONTHLY } as any;
      plansService.getPlanById.mockReturnValue(freePlan);
      const calculateUsage = jest.spyOn(service, 'calculateCompanyUsage');

      await expect(service.getCompanyPlan('comp_1')).resolves.toBe(freePlan);

      expect(plansService.getPlanById).toHaveBeenCalledWith(
        PlanId.FREE_MONTHLY,
      );
      expect(companiesService.getCompanyById).not.toHaveBeenCalled();
      expect(calculateUsage).not.toHaveBeenCalled();
    });

    it('returns the effective paid plan without calculating usage', async () => {
      const tx = {} as any;
      const paidPlan = { id: PlanId.PRO_MONTHLY } as any;
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValue({
        id: 'sub_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 86400000),
      });
      plansService.getPlanById.mockReturnValue(paidPlan);
      const calculateUsage = jest.spyOn(service, 'calculateCompanyUsage');

      await expect(service.getCompanyPlan('comp_1', tx)).resolves.toBe(
        paidPlan,
      );

      expect(
        subscriptionRepo.findActiveOrPastDueByCompanyId,
      ).toHaveBeenCalledWith('comp_1', tx);
      expect(calculateUsage).not.toHaveBeenCalled();
    });

    it('keeps provider-backed scheduled plans unchanged until provider confirmation', async () => {
      const tx = {} as any;
      const periodEnd = new Date(Date.now() - 86400000);
      const activeSub = {
        id: 'sub_1',
        companyId: 'comp_1',
        planId: PlanId.STARTER_MONTHLY,
        scheduledPlanId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodEnd: periodEnd,
        currentPeriodStart: new Date(periodEnd.getTime() - 30 * 86400000),
        cancelAtPeriodEnd: false,
        providerSubId: 'provider_sub_1',
      };
      const currentPlan = {
        id: PlanId.STARTER_MONTHLY,
        interval: 'month',
      } as any;
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValue(
        activeSub,
      );
      subscriptionRepo.save.mockImplementation(async (subscription: any) => {
        return subscription;
      });
      plansService.getPlanById.mockReturnValue(currentPlan);
      const calculateUsage = jest.spyOn(service, 'calculateCompanyUsage');

      await expect(service.getCompanyPlan('comp_1', tx)).resolves.toBe(
        currentPlan,
      );

      expect(activeSub.planId).toBe(PlanId.STARTER_MONTHLY);
      expect(activeSub.scheduledPlanId).toBe(PlanId.PRO_MONTHLY);
      expect(subscriptionRepo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(calculateUsage).not.toHaveBeenCalled();
    });

    it('preserves the full subscription response and usage calculation', async () => {
      const tx = {} as any;
      const currentPeriodStart = new Date('2026-10-01T00:00:00Z');
      const currentPeriodEnd = new Date(Date.now() + 86400000);
      const activeSub = {
        id: 'sub_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
      };
      const plan = { id: PlanId.PRO_MONTHLY } as any;
      const usage = {
        activeJobs: 1,
        jobPostingsUsed: 2,
        teamMembersCount: 3,
      };
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValue(
        activeSub,
      );
      plansService.getPlanById.mockReturnValue(plan);
      jest.spyOn(service, 'calculateCompanyUsage').mockResolvedValue(usage);

      await expect(
        service.getSubscriptionForCompany('comp_1', tx),
      ).resolves.toEqual({
        id: 'sub_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        plan,
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        scheduledPlanId: null,
        scheduledPlan: null,
        usage,
      });
      expect(service.calculateCompanyUsage).toHaveBeenCalledWith(
        'comp_1',
        currentPeriodStart,
        currentPeriodEnd,
        tx,
      );
    });
  });

  describe('cancelSubscriptionAtPeriodEnd', () => {
    it('cancels active subscription at period end and emits cancellation scheduled event', async () => {
      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Acme Corp',
        email: 'info@acme.com',
      });
      plansService.getPlanById.mockReturnValue({
        id: PlanId.PRO_MONTHLY,
        name: 'Pro Monthly',
      } as any);

      const activeSub = {
        id: 'sub_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        providerSubId: 'sub_stripe_1',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date('2026-11-25'),
        cancelAtPeriodEnd: false,
      };

      subscriptionRepo.findOneByCompanyIdAndStatus.mockResolvedValue(activeSub);
      subscriptionRepo.findActiveOrPastDueByCompanyId.mockResolvedValue(
        activeSub,
      );
      subscriptionRepo.save.mockImplementation(async (sub: any) => sub);
      paymentProvider.cancelSubscriptionAtPeriodEnd.mockResolvedValue(
        undefined as any,
      );

      const result = await service.cancelSubscriptionAtPeriodEnd(
        'comp_1',
        'admin@acme.com',
      );

      expect(
        paymentProvider.cancelSubscriptionAtPeriodEnd,
      ).toHaveBeenCalledWith('sub_stripe_1');
      expect(activeSub.cancelAtPeriodEnd).toBe(true);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.cancellation_scheduled',
        new SubscriptionCancellationScheduledEvent(
          'admin@acme.com',
          'Acme Corp',
          'Pro Monthly',
          activeSub.currentPeriodEnd,
          'Acme Corp',
        ),
      );
      expect(result.cancelAtPeriodEnd).toBe(true);
    });
  });

  describe('markSubscriptionExpired', () => {
    it('emits subscription.expired when marking subscription expired', async () => {
      companiesService.getCompanyById.mockResolvedValue({
        id: 'comp_1',
        name: 'Acme Corp',
        email: 'billing@acme.com',
      });
      plansService.getPlanById.mockReturnValue({
        id: PlanId.PRO_MONTHLY,
        name: 'Pro Monthly',
      } as any);

      const expiredSub = {
        id: 'sub_1',
        companyId: 'comp_1',
        planId: PlanId.PRO_MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        scheduledPlanId: null,
      } as any;

      subscriptionRepo.save.mockImplementation(async (sub: any) => sub);

      const result = await service.markSubscriptionExpired(expiredSub);

      expect(result.status).toBe(SubscriptionStatus.EXPIRED);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.expired',
        new SubscriptionExpiredEvent(
          'billing@acme.com',
          'Acme Corp',
          'Pro Monthly',
          'Acme Corp',
        ),
      );
    });
  });
});
