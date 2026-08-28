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
import { SubscriptionStatus } from './domain/subscription-status.enum';
import { CompanyRole } from '@/features/company-members/domain/company-role.enum';
import { PlansService } from '@/features/plans/services/plans.service';
import { PlanId } from '@/features/plans/domain/plan-id.enum';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
  PaymentEvent,
  PaymentSubscription,
  PaymentEventType,
  PaymentSubscriptionStatus,
  PaymentProviderName,
} from './domain/payment-provider.interface';
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
  ) {}

  async createCheckoutSession(
    companyId: string,
    planId: string,
    userId: string,
    idempotencyKey?: string,
  ): Promise<string> {
    const plan = this.plansService.getPlanById(planId as PlanId);

    if (plan.isFree || !plan.paymentPriceId) {
      throw new BadRequestException(
        'Cannot create a payment checkout session for the Free plan.',
      );
    }

    // Check for existing active subscription
    const activeSub = await this.subscriptionRepo.findOne({
      where: { companyId, status: SubscriptionStatus.ACTIVE },
    });

    if (activeSub) {
      throw new ConflictException(
        'Company already has an active subscription.',
      );
    }

    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      relations: { members: { user: true } },
    });

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    let customerId = company.paymentCustomerId;

    const member = company.members?.find((m) => m.userId === userId);
    if (!member || member.role !== CompanyRole.ADMIN) {
      throw new ForbiddenException(
        'You are not authorized to manage subscriptions for this company.',
      );
    }

    if (!customerId) {
      const email = member.user?.email;
      if (!email) {
        throw new BadRequestException('User email is required for billing.');
      }

      const customer = await this.paymentProvider.createCustomer(
        email,
        company.name,
        idempotencyKey ? `create_customer_company_${companyId}` : undefined,
      );

      const updateResult = await this.companyRepo.update(
        { id: companyId, paymentCustomerId: IsNull() },
        { paymentCustomerId: customer.id },
      );

      if (updateResult.affected === 0) {
        const reloaded = await this.companyRepo.findOne({
          where: { id: companyId },
        });
        customerId = reloaded!.paymentCustomerId;
      } else {
        customerId = customer.id;
      }
    }

    const sessionIdempotencyKey = idempotencyKey || crypto.randomUUID();

    const session = await this.paymentProvider.createCheckoutSession({
      customerId: customerId!,
      priceId: plan.paymentPriceId,
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

  async handlePaymentWebhook(event: PaymentEvent): Promise<void> {
    const { id: eventId, type, subscriptionId } = event;

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

      if (latestPaymentSub) {
        if (!companyId) {
          this.logger.error(
            `Cannot sync subscription ${latestPaymentSub.id} without a resolved company ID. eventId: ${eventId}`,
          );
          throw new BadRequestException(
            'Unresolvable company ID for subscription webhook.',
          );
        }

        await this.syncSubscriptionState(
          latestPaymentSub,
          companyId,
          queryRunner.manager,
          event.provider,
        );
      }

      await queryRunner.commitTransaction();
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

  private async syncSubscriptionState(
    paymentSub: PaymentSubscription,
    companyId: string,
    entityManager: EntityManager,
    provider: PaymentProviderName,
  ) {
    const subRepo = entityManager.getRepository(SubscriptionOrmEntity);
    const localSub = await subRepo.findOne({
      where: { providerSubId: paymentSub.id },
    });

    let localStatus = SubscriptionStatus.ACTIVE;

    if (
      paymentSub.status === PaymentSubscriptionStatus.CANCELED ||
      paymentSub.status === PaymentSubscriptionStatus.UNPAID ||
      paymentSub.status === PaymentSubscriptionStatus.PAST_DUE
    ) {
      localStatus = SubscriptionStatus.EXPIRED; // Entitlement ended
    } else if (paymentSub.cancelAtPeriodEnd) {
      localStatus = SubscriptionStatus.ACTIVE; // Still entitled
    }

    if (
      paymentSub.status === PaymentSubscriptionStatus.CANCELED &&
      localSub?.status === SubscriptionStatus.CANCELLED
    ) {
      localStatus = SubscriptionStatus.EXPIRED;
    }

    if (paymentSub.status === PaymentSubscriptionStatus.CANCELED) {
      localStatus = SubscriptionStatus.CANCELLED;
    }

    const currentPeriodStart = paymentSub.currentPeriodStart;
    const currentPeriodEnd = paymentSub.currentPeriodEnd;
    const priceId = paymentSub.priceId;

    if (!priceId) {
      throw new BadRequestException(
        `Subscription ${paymentSub.id} has no price ID.`,
      );
    }

    const plan = this.plansService.getPlanByPaymentPriceId(priceId);

    try {
      if (localSub) {
        // Update existing
        localSub.status = localStatus;
        localSub.currentPeriodStart = currentPeriodStart;
        localSub.currentPeriodEnd = currentPeriodEnd;
        localSub.cancelAtPeriodEnd = paymentSub.cancelAtPeriodEnd;
        localSub.planId = plan.id;
        await subRepo.save(localSub);
      } else {
        // Create new
        const newSub = subRepo.create({
          companyId,
          providerSubId: paymentSub.id,
          provider,
          planId: plan.id,
          status: localStatus,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: paymentSub.cancelAtPeriodEnd,
        });
        await subRepo.save(newSub);
      }
    } catch (err: unknown) {
      // Partial Unique Index Violation: UNIQUE(companyId) WHERE status = 'ACTIVE'
      if (
        err instanceof Error &&
        'code' in err &&
        err.code === '23505' &&
        'constraint' in err &&
        err.constraint === 'IDX_UNIQUE_ACTIVE_SUBSCRIPTION'
      ) {
        this.logger.error(
          `Billing Inconsistency: Duplicate active subscription attempt for company ${companyId}. Payment Sub: ${paymentSub.id}`,
        );
        // throw (tx roll back)
        throw new Error('DUPLICATE_ACTIVE_SUBSCRIPTION_ANOMALY');
      }
      throw err;
    }
  }
}
