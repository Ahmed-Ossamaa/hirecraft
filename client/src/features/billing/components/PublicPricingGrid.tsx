"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui";
import { useAuthStore } from "@/shared/stores/auth-store";
import { UserUserType } from "@/shared/api/generated/model/userUserType";
import type { Plan } from "@/shared/api/generated/model";
import { PlanCardView } from "./PlanCardView";
import { BillingIntervalToggle } from "./BillingIntervalToggle";
import { calculateMaxAnnualDiscount } from "../utils/plan-pricing";
import { useCompanySubscription } from "../api/useBilling";
import { MdArrowForward, MdInfoOutline, MdCheckCircle } from "react-icons/md";

interface PublicPricingGridProps {
  initialPlans: Plan[];
}

export const PublicPricingGrid: React.FC<PublicPricingGridProps> = ({
  initialPlans,
}) => {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");

  const { isAuthenticated, user } = useAuthStore();
  const isWorker = isAuthenticated && user?.userType === UserUserType.CANDIDATE;
  const isEmployer = isAuthenticated && user?.userType === UserUserType.EMPLOYER;

  // subscription check for employers to show their active plan badge
  const { subscription } = useCompanySubscription();
  const currentPlanId = isEmployer ? subscription?.planId : undefined;
  const scheduledPlanId = isEmployer ? subscription?.scheduledPlanId : undefined;

  // Find plans for selected interval
  const freePlan = initialPlans.find((p) => p.price === 0);
  const starterPlan = initialPlans.find(
    (p) => p.name.toLowerCase() === "starter" && p.interval === billingInterval,
  );
  const proPlan = initialPlans.find(
    (p) =>
      (p.name.toLowerCase() === "pro" || p.name.toLowerCase() === "professional") &&
      p.interval === billingInterval,
  );
  const enterprisePlan = initialPlans.find(
    (p) => p.name.toLowerCase() === "enterprise" && p.interval === billingInterval,
  );

  const displayedPlans: Plan[] = [freePlan, starterPlan, proPlan, enterprisePlan].filter(
    (p): p is Plan => p !== undefined,
  );

  const maxDiscount = React.useMemo(
    () => calculateMaxAnnualDiscount(initialPlans),
    [initialPlans],
  );

  const renderPlanAction = (plan: Plan) => {
    // Worker / Job Seeker: No action btns
    if (isWorker) {
      return null;
    }

    // Employer: send to Dashboard Billing
    if (isEmployer) {
      const isCurrent = currentPlanId === plan.id;
      const isScheduled = scheduledPlanId === plan.id;

      if (isCurrent) {
        return (
          <Button
            variant="outline"
            className="w-full text-xs font-semibold cursor-default opacity-85 border-emerald-500/40 text-emerald-500"
            disabled
          >
            Active Plan
          </Button>
        );
      }

      if (isScheduled) {
        return (
          <Button
            variant="outline"
            className="w-full text-xs font-semibold cursor-default opacity-85 border-amber-500/40 text-amber-500"
            disabled
          >
            Downgrade Scheduled
          </Button>
        );
      }

      return (
        <Link href="/dashboard/company/billing" className="block w-full">
          <Button
            variant={plan.name.toLowerCase().includes("pro") ? "primary" : "outline"}
            className="w-full text-xs font-semibold cursor-pointer group"
            rightIcon={<MdArrowForward className="text-sm transition-transform group-hover:translate-x-0.5" />}
          >
            Manage in Dashboard
          </Button>
        </Link>
      );
    }

    // Guest: Send to /Auth?reg
    const planNameLower = plan.name.toLowerCase();
    const isPro = planNameLower === "pro" || planNameLower === "professional";

    const buttonLabel =
      plan.price === 0
        ? "Get Started Free"
        : isPro
          ? "Start with Pro"
          : `Choose ${plan.name}`;

    return (
      <Link href="/auth?mode=register" className="block w-full">
        <Button
          variant={isPro ? "primary" : "outline"}
          className="w-full text-xs font-semibold cursor-pointer group"
          rightIcon={<MdArrowForward className="text-sm transition-transform group-hover:translate-x-0.5" />}
        >
          {buttonLabel}
        </Button>
      </Link>
    );
  };

  return (
    <div className="space-y-12">
      {/* Interval Toggle */}
      <BillingIntervalToggle
        interval={billingInterval}
        onChange={setBillingInterval}
        maxDiscount={maxDiscount}
        subtext
      />

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {displayedPlans.map((plan) => {
          const correspondingMonthlyPlan = initialPlans.find(
            (p) => p.name.toLowerCase() === plan.name.toLowerCase() && p.interval === "month",
          );
          return (
            <PlanCardView
              key={plan.id}
              plan={plan}
              billingInterval={billingInterval}
              monthlyPrice={correspondingMonthlyPlan?.price}
              isCurrentPlan={isEmployer && currentPlanId === plan.id}
              isScheduledPlan={isEmployer && scheduledPlanId === plan.id}
              action={renderPlanAction(plan)}
            />
          );
        })}
      </div>

      {/* according to user type show different messages and actions*/}
      {isWorker && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <MdCheckCircle className="text-2xl" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Looking for CNC, Machining, or Manufacturing Jobs?
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Technically is <strong className="text-foreground">100% free for all candidates and operators</strong>. 
            Paid tiers are exclusively for companies posting jobs and hiring teams.
          </p>
          <div className="pt-2">
            <Link href="/jobs" className="inline-block">
              <Button variant="primary" size="sm" className="text-xs cursor-pointer">
                Browse Open Positions
              </Button>
            </Link>
          </div>
        </div>
      )}
{/* 
      {isEmployer && (
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4 p-4 rounded-xl bg-card border border-border/70 text-xs text-muted-foreground max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <MdInfoOutline className="text-lg text-primary shrink-0" />
            <span>
              Signed in as company employer. Change tiers, manage seats, or view payment history in your dashboard.
            </span>
          </div>
          <Link href="/dashboard/company/billing" className="shrink-0">
            <Button variant="outline" size="sm" className="text-xs shrink-0 cursor-pointer">
              Go to Billing Settings
            </Button>
          </Link>
        </div>
      )} */}
    </div>
  );
};
