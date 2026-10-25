import {
  Injectable,
  Inject,
  Optional,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import plansConfiguration from '@/config/plans.config';
import { type ConfigType } from '@nestjs/config';
import { Plan } from '../domain/plan.entity';
import { PlanId } from '../domain/plan-id.enum';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
} from '@/integrations/payment/domain/payment-provider.interface';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);
  private readonly plans: Map<PlanId, Plan> = new Map();
  private readonly paymentPriceToPlanId: Map<string, PlanId> = new Map();

  constructor(
    @Inject(plansConfiguration.KEY)
    private readonly plansConfig: ConfigType<typeof plansConfiguration>,
    @Optional()
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider?: PaymentProvider,
  ) {
    this.initializePlans();
  }

  private initializePlans() {
    const { prices } = this.plansConfig;

    const definePlan = (
      id: PlanId,
      name: string,
      interval: 'month' | 'year',
      paymentPriceId: string | null,
      limits: {
        maxJobPostings: number;
        maxActiveJobs: number;
        maxUsers: number;
      },
    ) => {
      const plan = new Plan(
        id,
        name,
        interval,
        0,
        'EGP',
        paymentPriceId,
        limits,
      );
      this.plans.set(id, plan);
      if (paymentPriceId) {
        this.paymentPriceToPlanId.set(paymentPriceId, id);
      }
    };

    // Free Tier
    definePlan(PlanId.FREE_MONTHLY, 'Free', 'month', null, {
      maxJobPostings: 1,
      maxActiveJobs: 1,
      maxUsers: 1,
    });

    // Starter Tier
    definePlan(
      PlanId.STARTER_MONTHLY,
      'Starter',
      'month',
      prices.starterMonthly,
      {
        maxJobPostings: 5,
        maxActiveJobs: 3,
        maxUsers: 3,
      },
    );
    definePlan(PlanId.STARTER_YEARLY, 'Starter', 'year', prices.starterYearly, {
      maxJobPostings: 60,
      maxActiveJobs: 3,
      maxUsers: 3,
    });

    // Pro Tier
    definePlan(PlanId.PRO_MONTHLY, 'Pro', 'month', prices.proMonthly, {
      maxJobPostings: 20,
      maxActiveJobs: 10,
      maxUsers: 10,
    });
    definePlan(PlanId.PRO_YEARLY, 'Pro', 'year', prices.proYearly, {
      maxJobPostings: 240,
      maxActiveJobs: 10,
      maxUsers: 10,
    });

    // Enterprise Tier
    definePlan(
      PlanId.ENTERPRISE_MONTHLY,
      'Enterprise',
      'month',
      prices.enterpriseMonthly,
      {
        maxJobPostings: 99999,
        maxActiveJobs: 99999,
        maxUsers: 99999,
      },
    );
    definePlan(
      PlanId.ENTERPRISE_YEARLY,
      'Enterprise',
      'year',
      prices.enterpriseYearly,
      {
        maxJobPostings: 99999,
        maxActiveJobs: 99999,
        maxUsers: 99999,
      },
    );
  }

  getPlanById(id: PlanId): Plan {
    const plan = this.plans.get(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found.`);
    }
    return plan;
  }

  getPlanByPaymentPriceId(paymentPriceId: string): Plan {
    const planId = this.paymentPriceToPlanId.get(paymentPriceId);
    if (!planId) {
      throw new NotFoundException(
        `No plan found for Payment Price ID ${paymentPriceId}`,
      );
    }
    return this.getPlanById(planId);
  }

  getPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  async getPlansWithPrices(): Promise<Plan[]> {
    const domainPlans = this.getPlans();

    if (!this.paymentProvider) {
      return domainPlans;
    }

    try {
      const providerPrices = await this.paymentProvider.getPrices();
      const activeCurrency =
        Array.from(providerPrices.values())[0]?.currency || 'EGP';

      return domainPlans.map((plan) => {
        if (!plan.paymentPriceId) {
          return new Plan(
            plan.id,
            plan.name,
            plan.interval,
            0,
            activeCurrency,
            null,
            plan.limits,
          );
        }

        const priceDetails = providerPrices.get(plan.paymentPriceId);
        if (!priceDetails) {
          this.logger.warn(
            `Price ID ${plan.paymentPriceId} for plan ${plan.id} not found in provider catalog.`,
          );
          return plan;
        }

        return new Plan(
          plan.id,
          priceDetails.productName || plan.name,
          priceDetails.interval || plan.interval,
          priceDetails.unitAmount,
          priceDetails.currency,
          plan.paymentPriceId,
          plan.limits,
        );
      });
    } catch (error) {
      this.logger.error(
        'Failed to retrieve plan prices from payment provider. Falling back to base plans.',
        error,
      );
      return domainPlans;
    }
  }
}
