import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  PROCESSED_WEBHOOK_REPOSITORY,
  type IProcessedWebhookRepository,
} from '../domain/processed-webhook.repo.interface';
import {
  JOB_POSTING_USAGE_REPOSITORY,
  type IJobPostingUsageRepository,
} from '../domain/job-posting-usage.repo.interface';
import {
  CurrentSubscriptionDto,
  SubscriptionUsageDto,
} from '../dto/billing-responses.dto';
import { SUBSCRIPTION_REPOSITORY } from '../domain/subscription.repo.interface';
import type { ISubscriptionRepository } from '../domain/subscription.repo.interface';
import {
  type IJobRepository,
  JOB_REPOSITORY,
} from '@/features/jobs/domain/job.repo.interface';
import {
  type ICompanyMemberRepository,
  COMPANY_MEMBER_REPOSITORY,
} from '@/features/company-members/domain/company-member.repo.interface';
import { CompaniesService } from '@/features/companies/companies.service';
import { Company } from '@/features/companies/domain/company.entity';
import { Subscription } from '../domain/subscription.entity';
import { SubscriptionStatus } from '../domain/subscription-status.enum';
import { PlansService } from '@/features/plans/services/plans.service';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import { Plan } from '@/features/plans/domain/plan.entity';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
  PaymentEvent,
  PaymentSubscription,
  PaymentEventType,
  PaymentSubscriptionStatus,
  PaymentProviderName,
} from '@/integrations/payment/domain/payment-provider.interface';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  SubscriptionCreatedEvent,
  SubscriptionCancellationScheduledEvent,
  SubscriptionDowngradeScheduledEvent,
  SubscriptionExpiredEvent,
} from '@/integrations/mail/mail.events';
import * as crypto from 'crypto';
@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly companiesService: CompaniesService,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
    private readonly dataSource: DataSource,
    private readonly plansService: PlansService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(JOB_POSTING_USAGE_REPOSITORY)
    private readonly jobPostingUsageRepo: IJobPostingUsageRepository,
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
    @Inject(COMPANY_MEMBER_REPOSITORY)
    private readonly companyMemberRepository: ICompanyMemberRepository,
    @Inject(PROCESSED_WEBHOOK_REPOSITORY)
    private readonly processedWebhookRepo: IProcessedWebhookRepository,
  ) {}

  /**
   * - Orchestrates upgrading, downgrading, or subscribing to a plan for a company.
   * - If the company is on Free tier: returns Stripe Checkout session.
   * - If the company is on an active paid plan:
   *   - Upgrade: Executes immediate in-place upgrade with cycle reset and fresh monthly quota.
   *   - Downgrade: Schedules downgrade for the end of the current billing cycle.
   */
  async changeSubscriptionPlan(
    companyId: string,
    targetPlanId: PlanId,
    userEmail?: string,
    idempotencyKey?: string,
  ): Promise<{
    action: 'CHECKOUT' | 'UPGRADED' | 'DOWNGRADE_SCHEDULED';
    url?: string | null;
    subscription?: CurrentSubscriptionDto;
  }> {
    const company = await this.companiesService.getCompanyById(companyId);

    const targetPlan = this.plansService.getPlanById(targetPlanId);

    const activeSub = await this.subscriptionRepo.findOneByCompanyIdAndStatus(
      companyId,
      SubscriptionStatus.ACTIVE,
    );

    // already on free plan
    if (!activeSub || !activeSub.providerSubId) {
      if (targetPlan.isFree) {
        throw new BadRequestException('Company is already on the Free plan.');
      }
      const url = await this.createCheckoutSession(
        companyId,
        targetPlanId,
        userEmail,
        idempotencyKey,
      );
      return { action: 'CHECKOUT', url };
    }

    // Already actively on this plan
    if (activeSub.planId === targetPlanId && !activeSub.scheduledPlanId) {
      throw new BadRequestException(
        'Company is already actively subscribed to this plan.',
      );
    }

    const currentPlan = this.plansService.getPlanById(activeSub.planId);

    // Downgrading to Free Tier
    if (targetPlan.isFree) {
      await this.cancelSubscriptionAtPeriodEnd(companyId, userEmail);
      const sub = await this.getSubscriptionForCompany(companyId);
      return { action: 'DOWNGRADE_SCHEDULED', subscription: sub };
    }

    // Compare Tier Levels (Upgrade vs Downgrade)
    const isUpgrade =
      targetPlan.tierLevel > currentPlan.tierLevel ||
      (targetPlan.tierLevel === currentPlan.tierLevel &&
        targetPlan.interval === 'year' &&
        currentPlan.interval === 'month');

    if (isUpgrade) {
      // Immediate Upgrade: full price charge, fresh billing cycle anchor, 0 used credits
      const paymentSub = await this.paymentProvider.upgradeSubscription(
        activeSub.providerSubId,
        targetPlan.paymentPriceId!,
      );

      activeSub.planId = targetPlan.id;
      activeSub.currentPeriodStart = paymentSub.currentPeriodStart;
      activeSub.currentPeriodEnd = paymentSub.currentPeriodEnd;
      activeSub.cancelAtPeriodEnd = false;
      activeSub.scheduledPlanId = null;
      await this.subscriptionRepo.save(activeSub);

      const recipientEmail = userEmail || company.email;
      this.notifySubscriptionActivated(
        companyId,
        company.name,
        targetPlan.name,
        activeSub.currentPeriodEnd,
        recipientEmail,
      );

      const sub = await this.getSubscriptionForCompany(companyId);
      return { action: 'UPGRADED', subscription: sub };
    } else {
      // Scheduled Downgrade: keep current higher plan & limits until currentPeriodEnd
      await this.paymentProvider.scheduleDowngrade(
        activeSub.providerSubId,
        targetPlan.paymentPriceId!,
      );

      activeSub.scheduledPlanId = targetPlan.id;
      await this.subscriptionRepo.save(activeSub);

      const recipientEmail = userEmail || company.email;
      if (recipientEmail) {
        this.eventEmitter.emit(
          'subscription.downgrade_scheduled',
          new SubscriptionDowngradeScheduledEvent(
            recipientEmail,
            company.name,
            currentPlan.name,
            targetPlan.name,
            activeSub.currentPeriodEnd,
            company.name,
          ),
        );
      }

      const sub = await this.getSubscriptionForCompany(companyId);
      return { action: 'DOWNGRADE_SCHEDULED', subscription: sub };
    }
  }

  /**
   * - Orchestrates the checkout session creation flow for a company.
   * - If an active subscription already exists, delegates directly to changeSubscriptionPlan.
   */
  async createCheckoutSession(
    companyId: string,
    planId: PlanId,
    userEmail?: string,
    idempotencyKey?: string,
  ): Promise<string> {
    const company = await this.companiesService.getCompanyById(companyId);

    const activeSub = await this.subscriptionRepo.findOneByCompanyIdAndStatus(
      companyId,
      SubscriptionStatus.ACTIVE,
    );

    if (activeSub) {
      const result = await this.changeSubscriptionPlan(
        companyId,
        planId,
        userEmail,
        idempotencyKey,
      );
      return result.url || '';
    }

    const plan = this.validatePaidPlan(planId);

    const customerId = await this.getOrCreatePaymentCustomer(
      company,
      userEmail,
    );

    const sessionIdempotencyKey = idempotencyKey || crypto.randomUUID();

    const session = await this.paymentProvider.createCheckoutSession({
      customerId,
      priceId: plan.paymentPriceId!,
      successUrl: '',
      cancelUrl: '',
      clientReferenceId: companyId,
      idempotencyKey: sessionIdempotencyKey,
    });

    if (!session.url) {
      throw new InternalServerErrorException(
        'Failed to create checkout session URL',
      );
    }

    return session.url;
  }

  /**
   * - Confirms and reconciles a paid checkout session directly from the payment provider.
   * - Provides synchronous fallback activation for users landing on the success page,
   *   eliminating race conditions with asynchronous webhook delivery.
   */
  async confirmCheckoutSession(
    sessionId: string,
    userEmail?: string,
  ): Promise<CurrentSubscriptionDto> {
    try {
      const sessionDetails =
        await this.paymentProvider.retrieveCheckoutSession(sessionId);

      if (sessionDetails.paymentStatus !== 'paid') {
        throw new BadRequestException('Checkout session is not paid.');
      }

      if (!sessionDetails.subscriptionId) {
        throw new BadRequestException(
          'No subscription found for this checkout session.',
        );
      }

      const companyId = sessionDetails.companyId;
      if (!companyId) {
        throw new BadRequestException(
          'No company found associated with this checkout session.',
        );
      }

      const company = await this.companiesService.getCompanyById(companyId);

      const paymentSub = await this.paymentProvider.retrieveSubscription(
        sessionDetails.subscriptionId,
      );

      const { notificationData, shouldReconcile } =
        await this.dataSource.transaction(async (tx) => {
          const syncResult = await this.syncSubscriptionState(
            paymentSub,
            companyId,
            tx,
            PaymentProviderName.STRIPE,
          );
          return {
            notificationData: syncResult?.notificationData ?? null,
            shouldReconcile: syncResult?.shouldReconcile ?? false,
          };
        });

      if (shouldReconcile) {
        this.eventEmitter.emit('subscription.reconcile', { companyId });
      }

      if (notificationData) {
        const recipientEmail = userEmail || company.email;
        this.notifySubscriptionActivated(
          notificationData.companyId,
          company.name,
          notificationData.planName,
          notificationData.currentPeriodEnd,
          recipientEmail,
        );
      }

      return this.getSubscriptionForCompany(companyId);
    } catch (err) {
      this.logger.error(
        `Failed to confirm checkout session ${sessionId}:`,
        err instanceof Error ? err.stack : err,
      );
      throw err;
    }
  }

  /**
   * - Retrieves the current subscription details for a company.
   * - Validates current paid entitlement JIT: if currentPeriodEnd <= NOW, treats subscription as EXPIRED.
   * - Returns active subscription information and plan details if valid,
   * or falls back to the Free plan with a deterministic rolling billing cycle.
   */
  async getSubscriptionForCompany(companyId: string, tx?: EntityManager) {
    const activeSub = await this.subscriptionRepo.findOneByCompanyIdAndStatus(
      companyId,
      SubscriptionStatus.ACTIVE,
      tx,
    );

    const now = new Date();

    if (activeSub) {
      if (activeSub.currentPeriodEnd && activeSub.currentPeriodEnd <= now) {
        if (activeSub.scheduledPlanId) {
          this.logger.log(
            `Subscription ${activeSub.id} for company ${companyId} passed period end. Transitioning JIT to scheduled plan ${activeSub.scheduledPlanId}.`,
          );
          activeSub.planId = activeSub.scheduledPlanId;
          activeSub.scheduledPlanId = null;
          activeSub.currentPeriodStart = new Date(activeSub.currentPeriodEnd);
          const nextEnd = new Date(activeSub.currentPeriodStart);
          const targetPlan = this.plansService.getPlanById(activeSub.planId);
          if (targetPlan.interval === 'year') {
            nextEnd.setFullYear(nextEnd.getFullYear() + 1);
          } else {
            nextEnd.setMonth(nextEnd.getMonth() + 1);
          }
          activeSub.currentPeriodEnd = nextEnd;
          await this.subscriptionRepo.save(activeSub, tx);
          this.eventEmitter.emit('subscription.reconcile', { companyId });
        } else {
          this.logger.log(
            `Subscription ${activeSub.id} for company ${companyId} passed period end (${activeSub.currentPeriodEnd.toISOString()}). Marking EXPIRED JIT.`,
          );
          activeSub.status = SubscriptionStatus.EXPIRED;
          await this.subscriptionRepo.save(activeSub, tx);
          this.eventEmitter.emit('subscription.reconcile', { companyId });
        }
      } else {
        const plan = this.plansService.getPlanById(activeSub.planId);
        const scheduledPlan = activeSub.scheduledPlanId
          ? this.plansService.getPlanById(activeSub.scheduledPlanId)
          : null;
        const usage = await this.calculateCompanyUsage(
          companyId,
          activeSub.currentPeriodStart,
          activeSub.currentPeriodEnd,
          tx,
        );
        return {
          id: activeSub.id,
          companyId: activeSub.companyId,
          planId: activeSub.planId,
          plan,
          status: activeSub.status,
          currentPeriodStart: activeSub.currentPeriodStart,
          currentPeriodEnd: activeSub.currentPeriodEnd,
          cancelAtPeriodEnd: activeSub.cancelAtPeriodEnd,
          scheduledPlanId: activeSub.scheduledPlanId ?? null,
          scheduledPlan,
          usage,
        };
      }
    }

    const company = await this.companiesService
      .getCompanyById(companyId)
      .catch(() => null);
    const anchorDate = company?.createdAt ?? now;
    const { periodStart, periodEnd } = this.calculateFreeTierPeriod(
      anchorDate,
      now,
    );

    const freePlan = this.plansService.getPlanById(PlanId.FREE_MONTHLY);
    const usage = await this.calculateCompanyUsage(
      companyId,
      periodStart,
      periodEnd,
      tx,
    );
    return {
      id: null,
      companyId,
      planId: freePlan.id,
      plan: freePlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      scheduledPlanId: null,
      scheduledPlan: null,
      usage,
    };
  }

  async calculateCompanyUsage(
    companyId: string,
    periodStart: Date | null,
    periodEnd: Date | null,
    tx?: EntityManager,
  ): Promise<SubscriptionUsageDto> {
    try {
      const [activeJobs, teamMembersCount, jobPostingsUsed] = await Promise.all(
        [
          this.jobRepository.countPublishedActiveByCompanyId(companyId, tx),
          this.companyMemberRepository.countReservedMembersByCompanyId(
            companyId,
            tx,
          ),
          this.jobPostingUsageRepo.countUsage(
            companyId,
            periodStart,
            periodEnd,
            tx,
          ),
        ],
      );

      return { activeJobs, jobPostingsUsed, teamMembersCount };
    } catch (err) {
      this.logger.error(
        `Failed to calculate usage for company ${companyId}`,
        err,
      );
      return { activeJobs: 0, jobPostingsUsed: 0, teamMembersCount: 0 };
    }
  }

  /**
   * Retrieves a paginated list of all subscriptions with optional filtering.
   */
  async findSubscriptions(
    options: PageOptionsDto,
    status?: SubscriptionStatus,
    planId?: PlanId,
  ): Promise<PaginatedResult<Subscription>> {
    return this.subscriptionRepo.findSubscriptions(options, status, planId);
  }

  /**
   * - Schedules cancellation of an active subscription at the end of the current billing period.
   * - Verifies company admin privileges and requests period-end cancellation with the payment provider.
   */
  async cancelSubscriptionAtPeriodEnd(companyId: string, userEmail?: string) {
    const activeSub = await this.subscriptionRepo.findOneByCompanyIdAndStatus(
      companyId,
      SubscriptionStatus.ACTIVE,
    );

    if (!activeSub) {
      throw new NotFoundException('No active subscription found to cancel.');
    }

    if (activeSub.cancelAtPeriodEnd) {
      throw new BadRequestException(
        'Subscription is already scheduled for cancellation at the end of the period.',
      );
    }

    if (!activeSub.providerSubId) {
      throw new BadRequestException(
        'Free or non-provider subscription cannot be canceled via payment provider.',
      );
    }

    await this.paymentProvider.cancelSubscriptionAtPeriodEnd(
      activeSub.providerSubId,
    );

    activeSub.cancelAtPeriodEnd = true;
    await this.subscriptionRepo.save(activeSub);

    const company = await this.companiesService
      .getCompanyById(companyId)
      .catch(() => null);
    const plan = this.plansService.getPlanById(activeSub.planId);
    const recipientEmail = userEmail || company?.email;

    if (company && recipientEmail) {
      this.eventEmitter.emit(
        'subscription.cancellation_scheduled',
        new SubscriptionCancellationScheduledEvent(
          recipientEmail,
          company.name,
          plan.name,
          activeSub.currentPeriodEnd,
          company.name,
        ),
      );
    }

    return {
      id: activeSub.id,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: activeSub.currentPeriodEnd,
    };
  }

  /**
   * - Entry point for processing asynchronous payment provider webhooks.
   * - Resolves the webhook context and delegates execution to the transactional processor.
   */
  async handlePaymentWebhook(event: PaymentEvent): Promise<void> {
    const { latestPaymentSub, companyId } =
      await this.resolveWebhookContext(event);

    await this.processWebhookTransaction(event, latestPaymentSub, companyId);
  }

  async findExpiredActiveSubscriptions(
    now: Date = new Date(),
    tx?: EntityManager,
  ): Promise<Subscription[]> {
    return this.subscriptionRepo.findExpiredActiveSubscriptions(now, tx);
  }

  async markSubscriptionExpired(
    subscription: Subscription,
    tx?: EntityManager,
  ): Promise<Subscription> {
    if (subscription.scheduledPlanId) {
      this.logger.log(
        `Subscription ${subscription.id} transitioning to scheduled plan ${subscription.scheduledPlanId} at period end.`,
      );
      subscription.planId = subscription.scheduledPlanId;
      subscription.scheduledPlanId = null;
      subscription.currentPeriodStart = new Date(subscription.currentPeriodEnd);
      const nextEnd = new Date(subscription.currentPeriodStart);
      const targetPlan = this.plansService.getPlanById(subscription.planId);
      if (targetPlan.interval === 'year') {
        nextEnd.setFullYear(nextEnd.getFullYear() + 1);
      } else {
        nextEnd.setMonth(nextEnd.getMonth() + 1);
      }
      subscription.currentPeriodEnd = nextEnd;
      return this.subscriptionRepo.save(subscription, tx);
    }
    subscription.status = SubscriptionStatus.EXPIRED;
    const saved = await this.subscriptionRepo.save(subscription, tx);

    const company = await this.companiesService
      .getCompanyById(subscription.companyId)
      .catch(() => null);
    const expiredPlan = this.plansService.getPlanById(subscription.planId);

    if (company?.email) {
      this.eventEmitter.emit(
        'subscription.expired',
        new SubscriptionExpiredEvent(
          company.email,
          company.name,
          expiredPlan.name,
          company.name,
        ),
      );
    }

    return saved;
  }

  /**
   * - Validates that the requested plan exists and is a paid tier with a price ID.
   * - Throws BadRequestException if attempting to initiate checkout for a free plan.
   */
  private validatePaidPlan(planId: PlanId): Plan {
    const plan = this.plansService.getPlanById(planId);
    if (plan.isFree || !plan.paymentPriceId) {
      throw new BadRequestException(
        'Cannot create a payment checkout session for the Free plan.',
      );
    }
    return plan;
  }

  /**
   * - Checks if the company already has an active subscription record.
   * - Throws ConflictException if an active subscription is found.
   */
  private async ensureNoActiveSubscription(companyId: string): Promise<void> {
    const activeSub = await this.subscriptionRepo.findOneByCompanyIdAndStatus(
      companyId,
      SubscriptionStatus.ACTIVE,
    );

    if (activeSub) {
      throw new ConflictException(
        'Company already has an active subscription.',
      );
    }
  }

  /**
   * - Returns the companyexisting payment customer ID
   * or creates a new customer via the provider using a deterministic key.
   * - Handles concurrent customer creation safely using an atomic conditional database update.
   */
  private async getOrCreatePaymentCustomer(
    company: Company,
    userEmail?: string,
  ): Promise<string> {
    if (company.paymentCustomerId) {
      return company.paymentCustomerId;
    }

    const customerEmail = userEmail || company.email;
    if (!customerEmail) {
      throw new BadRequestException('Email is required for billing.');
    }

    const customer = await this.paymentProvider.createCustomer(
      customerEmail,
      company.name,
      `create_customer_company_${company.id}`,
    );

    const updated = await this.companiesService.updatePaymentCustomerIdIfNull(
      company.id,
      customer.id,
    );

    if (!updated) {
      const reloaded = await this.companiesService.getCompanyById(company.id);
      if (!reloaded?.paymentCustomerId) {
        throw new InternalServerErrorException(
          'Failed to resolve payment customer ID after customer creation.',
        );
      }
      return reloaded.paymentCustomerId;
    }

    return customer.id;
  }

  /**
   * Fetches latest subscription state from the payment provider
   * and resolves the target company ID for a webhook event.
   */
  private async resolveWebhookContext(event: PaymentEvent): Promise<{
    latestPaymentSub: PaymentSubscription | null;
    companyId: string | null;
  }> {
    const { type, subscriptionId } = event;
    let latestPaymentSub: PaymentSubscription | null = null;
    let companyId: string | null = null;

    if (
      type === PaymentEventType.CHECKOUT_COMPLETED ||
      type === PaymentEventType.SUBSCRIPTION_CREATED ||
      type === PaymentEventType.SUBSCRIPTION_UPDATED ||
      type === PaymentEventType.SUBSCRIPTION_DELETED
    ) {
      if (type === PaymentEventType.CHECKOUT_COMPLETED) {
        companyId = event.clientReferenceId ?? null;
      }

      if (subscriptionId) {
        try {
          latestPaymentSub =
            await this.paymentProvider.retrieveSubscription(subscriptionId);

          if (!companyId) {
            const existingSub =
              await this.subscriptionRepo.findOneByProviderSubId(
                subscriptionId,
              );
            if (existingSub) {
              companyId = existingSub.companyId;
            } else {
              this.logger.warn(
                `Could not determine company for subscription ${subscriptionId}`,
              );
            }
          }
        } catch (err) {
          this.logger.error(
            `Failed to retrieve subscription ${subscriptionId} from provider`,
          );
          throw err;
        }
      }
    }

    return { latestPaymentSub, companyId };
  }

  /**
   * Handles database transaction lifecycle for webhooks,
   * enforcing event idempotency and updating subscription state.
   */
  private async processWebhookTransaction(
    event: PaymentEvent,
    latestPaymentSub: PaymentSubscription | null,
    companyId: string | null,
  ): Promise<void> {
    const { id: eventId, type } = event;

    try {
      const result = await this.dataSource.transaction(async (tx) => {
        const isNewEvent = await this.processedWebhookRepo.tryRecordEvent(
          event.provider,
          eventId,
          type,
          tx,
        );

        if (!isNewEvent) {
          this.logger.log(
            `Webhook event ${eventId} already processed. Skipping.`,
          );
          return null;
        }

        let notificationData: {
          companyId: string;
          planName: string;
          currentPeriodEnd: Date | null;
        } | null = null;
        let shouldReconcile = false;

        if (latestPaymentSub) {
          if (!companyId) {
            this.logger.error(
              `Cannot sync subscription ${latestPaymentSub.id} without a resolved company ID. eventId: ${eventId}`,
            );
            throw new BadRequestException(
              'Unresolvable company ID for subscription webhook.',
            );
          }

          const syncResult = await this.syncSubscriptionState(
            latestPaymentSub,
            companyId,
            tx,
            event.provider,
          );
          if (syncResult) {
            notificationData = syncResult.notificationData;
            shouldReconcile = syncResult.shouldReconcile;
          }
        }

        return { notificationData, shouldReconcile };
      });

      if (!result) {
        return;
      }

      if (result.shouldReconcile && companyId) {
        this.eventEmitter.emit('subscription.reconcile', { companyId });
      }

      if (result.notificationData) {
        const company = await this.companiesService
          .getCompanyById(result.notificationData.companyId)
          .catch(() => null);

        if (company) {
          this.notifySubscriptionActivated(
            result.notificationData.companyId,
            company.name,
            result.notificationData.planName,
            result.notificationData.currentPeriodEnd,
            company.email,
          );
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'DUPLICATE_ACTIVE_SUBSCRIPTION_ANOMALY'
      ) {
        this.logger.warn(
          `Anomaly caught and logged. Returning 200 OK to Stripe to prevent retries.`,
        );
        return;
      }

      this.logger.error(`Error processing webhook event ${eventId}`, error);
      throw error;
    }
  }

  /**
   * Persists or updates the local subscription entity state based on the normalized status received from the payment provider.
   */
  private async syncSubscriptionState(
    paymentSub: PaymentSubscription,
    companyId: string,
    entityManager: EntityManager,
    provider: PaymentProviderName,
  ): Promise<{
    notificationData: {
      companyId: string;
      planName: string;
      currentPeriodEnd: Date | null;
    } | null;
    shouldReconcile: boolean;
  } | null> {
    if (!paymentSub.priceId) {
      throw new BadRequestException(
        `Subscription ${paymentSub.id} has no price ID.`,
      );
    }

    const localStatus = this.mapProviderStatusToLocal(paymentSub.status);
    const plan = this.plansService.getPlanByPaymentPriceId(paymentSub.priceId);

    const localSub = await this.subscriptionRepo.findOneByProviderSubId(
      paymentSub.id,
      entityManager,
    );
    const previousPlanId = localSub?.planId;

    try {
      await this.persistSubscriptionEntity({
        paymentSub,
        companyId,
        planId: plan.id,
        localStatus,
        provider,
        entityManager,
      });

      let shouldReconcile = false;

      if (localStatus === SubscriptionStatus.ACTIVE) {
        if (previousPlanId && previousPlanId !== plan.id) {
          const previousPlan = this.plansService.getPlanById(previousPlanId);
          const isDowngrade =
            plan.tierLevel < previousPlan.tierLevel ||
            (plan.tierLevel === previousPlan.tierLevel &&
              plan.interval === 'month' &&
              previousPlan.interval === 'year');

          if (isDowngrade) {
            this.logger.log(
              `Downgrade detected via provider sync for company ${companyId} (${previousPlan.name} -> ${plan.name}). Reconcile will be emitted post-commit.`,
            );
            shouldReconcile = true;
          }
        }

        return {
          notificationData: {
            companyId,
            planName: plan.name,
            currentPeriodEnd: paymentSub.currentPeriodEnd,
          },
          shouldReconcile,
        };
      } else {
        shouldReconcile = true;
        return {
          notificationData: null,
          shouldReconcile,
        };
      }
    } catch (err: unknown) {
      this.handleSubscriptionSyncError(err, companyId, paymentSub.id);
      return null;
    }
  }

  /**
   * Maps payment provider subscription status to local domain subscription status.
   */
  private mapProviderStatusToLocal(
    status: PaymentSubscriptionStatus,
  ): SubscriptionStatus {
    switch (status) {
      case PaymentSubscriptionStatus.UNPAID:
      case PaymentSubscriptionStatus.PAST_DUE:
        return SubscriptionStatus.EXPIRED;
      case PaymentSubscriptionStatus.CANCELED:
        return SubscriptionStatus.CANCELLED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  /**
   * Creates or updates local subscription entity in the database.
   */
  private async persistSubscriptionEntity(params: {
    paymentSub: PaymentSubscription;
    companyId: string;
    planId: PlanId;
    localStatus: SubscriptionStatus;
    provider: PaymentProviderName;
    entityManager: EntityManager;
  }): Promise<void> {
    const {
      paymentSub,
      companyId,
      planId,
      localStatus,
      provider,
      entityManager,
    } = params;
    const localSub = await this.subscriptionRepo.findOneByProviderSubId(
      paymentSub.id,
      entityManager,
    );

    if (localSub) {
      localSub.status = localStatus;
      localSub.currentPeriodStart = paymentSub.currentPeriodStart;
      localSub.currentPeriodEnd = paymentSub.currentPeriodEnd;
      localSub.cancelAtPeriodEnd = paymentSub.cancelAtPeriodEnd;
      localSub.planId = planId;
      await this.subscriptionRepo.save(localSub, entityManager);
    } else {
      //mark the old record for this company as cancelled and insert new record
      if (localStatus === SubscriptionStatus.ACTIVE) {
        const existingActive =
          await this.subscriptionRepo.findOneByCompanyIdAndStatus(
            companyId,
            SubscriptionStatus.ACTIVE,
            entityManager,
          );
        if (existingActive) {
          existingActive.status = SubscriptionStatus.CANCELLED;
          await this.subscriptionRepo.save(existingActive, entityManager);
        }
      }

      await this.subscriptionRepo.create(
        {
          companyId,
          providerSubId: paymentSub.id,
          provider,
          planId,
          status: localStatus,
          currentPeriodStart: paymentSub.currentPeriodStart,
          currentPeriodEnd: paymentSub.currentPeriodEnd,
          cancelAtPeriodEnd: paymentSub.cancelAtPeriodEnd,
        },
        entityManager,
      );
    }
  }

  private notifySubscriptionActivated(
    companyId: string,
    companyName: string,
    planName: string,
    currentPeriodEnd: Date | null,
    recipientEmail?: string | null,
  ): void {
    if (!recipientEmail) {
      this.logger.warn(
        `Cannot emit subscription.created event for company ${companyId}: no recipient email available.`,
      );
      return;
    }

    this.eventEmitter.emit(
      'subscription.created',
      new SubscriptionCreatedEvent(
        recipientEmail,
        companyName,
        planName,
        currentPeriodEnd,
        companyName,
      ),
    );
  }

  /**
   * Handles unique constraint violations and unexpected errors during subscription synchronization.
   */
  private handleSubscriptionSyncError(
    err: unknown,
    companyId: string,
    providerSubId: string,
  ): never {
    if (
      err instanceof Error &&
      'code' in err &&
      err.code === '23505' &&
      'constraint' in err &&
      err.constraint === 'IDX_UNIQUE_ACTIVE_SUBSCRIPTION'
    ) {
      this.logger.error(
        `Billing Inconsistency: Duplicate active subscription attempt for company ${companyId}. Payment Sub: ${providerSubId}`,
      );
      throw new Error('DUPLICATE_ACTIVE_SUBSCRIPTION_ANOMALY');
    }
    throw err;
  }

  private calculateFreeTierPeriod(
    anchorDate: Date,
    now: Date,
  ): { periodStart: Date; periodEnd: Date } {
    let periodStart = new Date(anchorDate);
    while (true) {
      const nextMonth = new Date(periodStart);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      if (nextMonth > now) {
        return { periodStart, periodEnd: nextMonth };
      }
      periodStart = nextMonth;
    }
  }
}
