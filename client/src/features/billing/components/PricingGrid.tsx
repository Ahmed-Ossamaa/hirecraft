"use client";

import React, { useState } from "react";
import { PlanCard } from "./PlanCard";
import { useChangeSubscriptionPlan } from "../api/useBilling";
import { BillingIntervalToggle } from "./BillingIntervalToggle";
import type { Plan, PlanId } from "@/shared/api/generated/model";
import { calculateMaxAnnualDiscount } from "../utils/plan-pricing";

interface PricingGridProps {
  plans: Plan[];
  currentPlan?: Plan | null;
  currentPlanId?: PlanId;
  scheduledPlanId?: PlanId | null;
  currentPeriodEnd?: string | null;
  isAdmin: boolean;
}

export const PricingGrid: React.FC<PricingGridProps> = ({
  plans,
  currentPlan,
  currentPlanId,
  scheduledPlanId,
  currentPeriodEnd,
  isAdmin,
}) => {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const { changePlan, isPending } = useChangeSubscriptionPlan();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);

  const handleSelectPlan = async (planId: PlanId) => {
    setSelectedPlanId(planId);
    try {
      await changePlan(planId);
    } finally {
      setSelectedPlanId(null);
    }
  };

  // Find plans for the selected interval
  const freePlan = plans.find((p) => p.price === 0);
  const starterPlan = plans.find(
    (p) => p.name.toLowerCase() === "starter" && p.interval === billingInterval,
  );
  const proPlan = plans.find(
    (p) =>
      (p.name.toLowerCase() === "pro" || p.name.toLowerCase() === "professional") &&
      p.interval === billingInterval,
  );
  const enterprisePlan = plans.find(
    (p) => p.name.toLowerCase() === "enterprise" && p.interval === billingInterval,
  );

  const displayedPlans: Plan[] = [freePlan, starterPlan, proPlan, enterprisePlan].filter(
    (p): p is Plan => p !== undefined,
  );

  // Calculate maximum annual discount across tiers for the toggle badge
  const maxDiscount = React.useMemo(() => calculateMaxAnnualDiscount(plans), [plans]);

  return (
    <div className="space-y-8">
      {/* Title & Interval Toggle */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
          Find the Right Plan for Your Team
        </h2>
        <p className="text-sm text-muted-foreground">
          Scale your hiring capacity as your business grows. Change or cancel anytime.
        </p>

        <BillingIntervalToggle
          interval={billingInterval}
          onChange={setBillingInterval}
          maxDiscount={maxDiscount}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {displayedPlans.map((plan) => {
          const correspondingMonthlyPlan = plans.find(
            (p) => p.name.toLowerCase() === plan.name.toLowerCase() && p.interval === "month",
          );

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              monthlyPrice={correspondingMonthlyPlan?.price}
              currentPlan={currentPlan}
              currentPeriodEnd={currentPeriodEnd}
              billingInterval={billingInterval}
              isCurrentPlan={currentPlanId === plan.id}
              isScheduledPlan={scheduledPlanId === plan.id}
              isAdmin={isAdmin}
              onSelectPlan={handleSelectPlan}
              isLoading={isPending && selectedPlanId === plan.id}
            />
          );
        })}
      </div>
    </div>
  );
};
