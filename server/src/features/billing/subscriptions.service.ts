import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, EntityManager } from 'typeorm';
import { SubscriptionOrmEntity } from './infrastructure/subscription.orm-entity';
import { ProcessedWebhookOrmEntity } from './infrastructure/processed-webhook.orm-entity';
import { CompanyOrmEntity } from '@/features/companies/infrastructure/company.orm-entity';
import { CompanyMemberOrmEntity } from '@/features/company-members/infrastructure/company-member.orm-entity';
import { SubscriptionStatus } from './domain/subscription-status.enum';
import { CompanyRole } from '@/features/company-members/domain/company-role.enum';
import { CompanyMemberStatus } from '@/features/company-members/domain/company-member-status.enum';
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
} from './domain/payment-provider.interface';
import { PageOptionsDto } from '@/common/pagination/page-options.dto';
import { PaginatedResult } from '@/common/pagination/paginated-results';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionCreatedEvent } from '@/integrations/mail/mail.events';
import * as crypto from 'crypto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptionRepo: Repository<SubscriptionOrmEntity>,
    @InjectRepository(CompanyOrmEntity)
    private readonly companyRepo: Repository<CompanyOrmEntity>,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
    private readonly dataSource: DataSource,
    private readonly plansService: PlansService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * - Orchestrates the checkout session creation flow for a company.
   * - Validates company admin access, paid plan eligibility, ensures no active subscription exists,
   * creates/resolves the payment provider customer, and returns the Stripe checkout URL.
   */
  async createCheckoutSession(
    companyId: string,
    planId: PlanId,
    userId: string,
    idempotencyKey?: string,
  ): Promise<string> {
    const { company, adminMember } = await this.getCompanyWithAdminCheck(
      companyId,
      userId,
    );

    const plan = this.validatePaidPlan(planId);

    await this.ensureNoActiveSubscription(companyId);

    const customerId = await this.getOrCreatePaymentCustomer(
      company,
      adminMember.user?.email,
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
   * - Retrieves the current subscription details for a company.
   * - Returns active subscription information and plan details if present,
   * Or defaults to the free plan tier.
   */
  async getSubscriptionForCompany(companyId: string, tx?: EntityManager) {
    const repo = tx
      ? tx.getRepository(SubscriptionOrmEntity)
      : this.subscriptionRepo;
    const activeSub = await repo.findOne({
      where: { companyId, status: SubscriptionStatus.ACTIVE },
    });

    if (activeSub) {
      const plan = this.plansService.getPlanById(activeSub.planId);
      return {
        id: activeSub.id,
        companyId: activeSub.companyId,
        planId: activeSub.planId,
        plan,
        status: activeSub.status,
        currentPeriodStart: activeSub.currentPeriodStart,
        currentPeriodEnd: activeSub.currentPeriodEnd,
        cancelAtPeriodEnd: activeSub.cancelAtPeriodEnd,
      };
    }

    const freePlan = this.plansService.getPlanById(PlanId.FREE_MONTHLY);
    return {
      id: null,
      companyId,
      planId: freePlan.id,
      plan: freePlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  /**
   * Retrieves a paginated list of all subscriptions with optional filtering.
   */
  async findSubscriptions(
    options: PageOptionsDto,
    status?: SubscriptionStatus,
    planId?: PlanId,
  ): Promise<
    PaginatedResult<{
      id: string;
      companyId: string;
      planId: string;
      provider: string;
      status: SubscriptionStatus;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      createdAt: Date;
    }>
  > {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;
    const order = options.order || 'DESC';

    const qb = this.subscriptionRepo.createQueryBuilder('sub');

    if (status) {
      qb.andWhere('sub.status = :status', { status });
    }

    if (planId) {
      qb.andWhere('sub.planId = :planId', { planId });
    }

    qb.orderBy('sub.createdAt', order);
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const sanitizedData = items.map((sub) => ({
      id: sub.id,
      companyId: sub.companyId,
      planId: sub.planId,
      provider: sub.provider,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      createdAt: sub.createdAt,
    }));

    return {
      data: sanitizedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * - Schedules cancellation of an active subscription at the end of the current billing period.
   * - Verifies company admin privileges and requests period-end cancellation with the payment provider.
   */
  async cancelSubscriptionAtPeriodEnd(companyId: string, userId: string) {
    await this.getCompanyWithAdminCheck(companyId, userId);

    const activeSub = await this.subscriptionRepo.findOne({
      where: { companyId, status: SubscriptionStatus.ACTIVE },
    });

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

  // ----- Private Methods -------

  /**
   * - Loads a company by ID and verifies that the specified user is an active admin member.
   * - Throws NotFoundException if company does not exist or ForbiddenException if user is not an admin.
   */
  private async getCompanyWithAdminCheck(
    companyId: string,
    userId: string,
  ): Promise<{
    company: CompanyOrmEntity;
    adminMember: CompanyMemberOrmEntity;
  }> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      relations: { members: { user: true } },
    });

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    const member = company.members?.find((m) => m.userId === userId);
    if (!member || member.role !== CompanyRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to manage subscriptions for this company.',
      );
    }

    return { company, adminMember: member };
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
    const activeSub = await this.subscriptionRepo.findOne({
      where: { companyId, status: SubscriptionStatus.ACTIVE },
    });

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
    company: CompanyOrmEntity,
    userEmail?: string,
  ): Promise<string> {
    if (company.paymentCustomerId) {
      return company.paymentCustomerId;
    }

    if (!userEmail) {
      throw new BadRequestException('User email is required for billing.');
    }

    const customer = await this.paymentProvider.createCustomer(
      userEmail,
      company.name,
      `create_customer_company_${company.id}`,
    );

    const updateResult = await this.companyRepo.update(
      { id: company.id, paymentCustomerId: IsNull() },
      { paymentCustomerId: customer.id },
    );

    if (updateResult.affected === 0) {
      const reloaded = await this.companyRepo.findOne({
        where: { id: company.id },
      });
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
            const existingSub = await this.subscriptionRepo.findOne({
              where: { providerSubId: subscriptionId },
            });
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const processedRepo = queryRunner.manager.getRepository(
        ProcessedWebhookOrmEntity,
      );

      try {
        await processedRepo.insert({
          provider: event.provider,
          eventId: eventId,
          type: type,
        });
      } catch (err: unknown) {
        if (err instanceof Error && 'code' in err && err.code === '23505') {
          this.logger.log(
            `Webhook event ${eventId} already processed. Skipping.`,
          );
          await queryRunner.rollbackTransaction();
          return;
        }
        throw err;
      }

      let notificationData: {
        companyId: string;
        planName: string;
        currentPeriodEnd: Date | null;
      } | null = null;

      if (latestPaymentSub) {
        if (!companyId) {
          this.logger.error(
            `Cannot sync subscription ${latestPaymentSub.id} without a resolved company ID. eventId: ${eventId}`,
          );
          throw new BadRequestException(
            'Unresolvable company ID for subscription webhook.',
          );
        }

        notificationData = await this.syncSubscriptionState(
          latestPaymentSub,
          companyId,
          queryRunner.manager,
          event.provider,
        );
      }

      await queryRunner.commitTransaction();

      if (notificationData) {
        await this.notifySubscriptionActivated(
          notificationData.companyId,
          notificationData.planName,
          notificationData.currentPeriodEnd,
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();

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
    } finally {
      await queryRunner.release();
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
    companyId: string;
    planName: string;
    currentPeriodEnd: Date | null;
  } | null> {
    if (!paymentSub.priceId) {
      throw new BadRequestException(
        `Subscription ${paymentSub.id} has no price ID.`,
      );
    }

    const localStatus = this.mapProviderStatusToLocal(paymentSub.status);
    const plan = this.plansService.getPlanByPaymentPriceId(paymentSub.priceId);

    try {
      await this.persistSubscriptionEntity({
        paymentSub,
        companyId,
        planId: plan.id,
        localStatus,
        provider,
        entityManager,
      });

      if (localStatus === SubscriptionStatus.ACTIVE) {
        return {
          companyId,
          planName: plan.name,
          currentPeriodEnd: paymentSub.currentPeriodEnd,
        };
      }
      return null;
    } catch (err: unknown) {
      this.handleSubscriptionSyncError(err, companyId, paymentSub.id);
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
    const subRepo = entityManager.getRepository(SubscriptionOrmEntity);
    const localSub = await subRepo.findOne({
      where: { providerSubId: paymentSub.id },
    });

    if (localSub) {
      localSub.status = localStatus;
      localSub.currentPeriodStart = paymentSub.currentPeriodStart;
      localSub.currentPeriodEnd = paymentSub.currentPeriodEnd;
      localSub.cancelAtPeriodEnd = paymentSub.cancelAtPeriodEnd;
      localSub.planId = planId;
      await subRepo.save(localSub);
    } else {
      const newSub = subRepo.create({
        companyId,
        providerSubId: paymentSub.id,
        provider,
        planId,
        status: localStatus,
        currentPeriodStart: paymentSub.currentPeriodStart,
        currentPeriodEnd: paymentSub.currentPeriodEnd,
        cancelAtPeriodEnd: paymentSub.cancelAtPeriodEnd,
      });
      await subRepo.save(newSub);
    }
  }

  /**
   * Resolves the company admin user details and emits the subscription activation event.
   */
  private async notifySubscriptionActivated(
    companyId: string,
    planName: string,
    currentPeriodEnd: Date | null,
  ): Promise<void> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      relations: { members: { user: true } },
    });

    const adminMember = company?.members?.find(
      (m) =>
        m.role === CompanyRole.ADMIN &&
        m.status === CompanyMemberStatus.ACTIVE &&
        m.user?.email,
    );

    if (company && adminMember?.user?.email) {
      const recipientName =
        adminMember.user.firstName && adminMember.user.lastName
          ? `${adminMember.user.firstName} ${adminMember.user.lastName}`
          : company.name;

      this.eventEmitter.emit(
        'subscription.created',
        new SubscriptionCreatedEvent(
          adminMember.user.email,
          company.name,
          planName,
          currentPeriodEnd,
          recipientName,
        ),
      );
    }
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
}
