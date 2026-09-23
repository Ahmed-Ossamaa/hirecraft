import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import plansConfiguration from '@/config/plans.config';
import { type ConfigType } from '@nestjs/config';
import { Plan } from '../domain/plan.entity';
import { PlanId } from '../domain/plan-id.enum';

@Injectable()
export class PlansService {
  private readonly plans: Map<PlanId, Plan>;
  private readonly paymentPriceToPlanId: Map<string, PlanId>;

  constructor(
    @Inject(plansConfiguration.KEY)
    private readonly plansConfig: ConfigType<typeof plansConfiguration>,
  ) {
    this.plans = new Map();
    this.paymentPriceToPlanId = new Map();
    this.initializePlans();
  }

  private initializePlans() {
    const { prices } = this.plansConfig;

    const definePlan = (
      id: PlanId,
      name: string,
      interval: 'month' | 'year',
      paymentPriceId: string | null,
      limits: { maxJobPostings: number; maxUsers: number },
    ) => {
      const plan = new Plan(id, name, interval, paymentPriceId, limits);
      this.plans.set(id, plan);
      if (paymentPriceId) {
        this.paymentPriceToPlanId.set(paymentPriceId, id);
      }
    };

    // Free Tier
    definePlan(PlanId.FREE_MONTHLY, 'Free', 'month', null, {
      maxJobPostings: 1,
      maxUsers: 1,
    });
    definePlan(PlanId.FREE_YEARLY, 'Free', 'year', null, {
      maxJobPostings: 1,
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
        maxUsers: 3,
      },
    );
    definePlan(PlanId.STARTER_YEARLY, 'Starter', 'year', prices.starterYearly, {
      maxJobPostings: 5,
      maxUsers: 3,
    });

    // Professional Tier
    definePlan(PlanId.PRO_MONTHLY, 'Professional', 'month', prices.proMonthly, {
      maxJobPostings: 20,
      maxUsers: 10,
    });
    definePlan(PlanId.PRO_YEARLY, 'Professional', 'year', prices.proYearly, {
      maxJobPostings: 20,
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
}
