"use client";

import React from "react";
import { Button } from "@/shared/components/ui/Button";
import { useConfirm } from "@/shared/providers/confirm-provider";
import type { Plan, PlanId } from "@/shared/api/generated/model";
import { getTierLevel } from "../utils/plan-features";
import { formatPlanPriceDisplay } from "../utils/plan-pricing";
import { PlanCardView } from "./PlanCardView";

export interface PlanCardProps {
  plan: Plan;
  monthlyPrice?: number;
  currentPlan?: Plan | null;
  currentPeriodEnd?: string | null;
  isCurrentPlan: boolean;
  isScheduledPlan?: boolean;
  billingInterval: "month" | "year";
  isAdmin: boolean;
  onSelectPlan: (planId: PlanId) => Promise<void>;
  isLoading: boolean;
}

/**
 * Dashboard subscription action wrapper for PlanCardView.
 * Handles confirmation dialogs, permissions, and upgrade/downgrade mutations.
 */
export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  monthlyPrice,
  currentPlan,
  currentPeriodEnd,
  isCurrentPlan,
  isScheduledPlan,
  billingInterval,
  isAdmin,
  onSelectPlan,
  isLoading,
}) => {
  const { confirm } = useConfirm();

  const isFree = plan.price === 0;
  const currentTier = getTierLevel(currentPlan);
  const targetTier = getTierLevel(plan);

  const isUpgrade =
    targetTier > currentTier ||
    (targetTier === currentTier &&
      plan.interval === "year" &&
      currentPlan?.interval === "month");

  const { formattedPrice } = formatPlanPriceDisplay(plan, billingInterval);

  const handleAction = async () => {
    if (isCurrentPlan || isScheduledPlan || !isAdmin || isFree) return;

    if (isUpgrade) {
      const isConfirmed = await confirm({
        title: `Upgrade to ${plan.name} (${billingInterval === "year" ? "Annual" : "Monthly"})`,
        message: `Upgrade to ${plan.name} immediately? You will be charged the full price of ${formattedPrice} today. A fresh 30-day billing cycle and your new quota of ${plan.limits.maxJobPostings} job postings will begin immediately.`,
        confirmText: `Upgrade & Pay ${formattedPrice}`,
        cancelText: "Cancel",
        variant: "primary",
      });

      if (isConfirmed) {
        await onSelectPlan(plan.id);
      }
    } else {
      const formattedEndDate = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "the end of your billing cycle";

      const isConfirmed = await confirm({
        title: `Schedule Downgrade to ${plan.name}`,
        message: `Schedule a downgrade to ${plan.name}? Your current ${currentPlan?.name || "active"} plan features, team seats, and postings will remain fully active until ${formattedEndDate}. On that date, your plan will automatically transition to ${plan.name}.`,
        confirmText: "Schedule Downgrade",
        cancelText: "Keep Current Plan",
        variant: "primary",
      });

      if (isConfirmed) {
        await onSelectPlan(plan.id);
      }
    }
  };

  const renderAction = () => {
    if (isCurrentPlan) {
      return (
        <Button
          variant="outline"
          className="w-full text-xs font-semibold cursor-default opacity-80 border-emerald-500/40 text-emerald-500"
          disabled
        >
          Active Plan
        </Button>
      );
    }

    if (isScheduledPlan) {
      return (
        <Button
          variant="outline"
          className="w-full text-xs font-semibold cursor-default opacity-80 border-amber-500/40 text-amber-500"
          disabled
        >
          Downgrade Scheduled
        </Button>
      );
    }

    return (
      <Button
        variant={isUpgrade ? "primary" : "outline"}
        className="w-full text-xs cursor-pointer"
        onClick={handleAction}
        disabled={!isAdmin || isFree || isLoading}
      >
        {isLoading
          ? isUpgrade
            ? "Upgrading..."
            : "Scheduling..."
          : !isAdmin
            ? "Admin Only"
            : isFree
              ? "Default Free Plan"
              : isUpgrade
                ? `Upgrade to ${plan.name}`
                : `Downgrade to ${plan.name}`}
      </Button>
    );
  };

  return (
    <PlanCardView
      plan={plan}
      billingInterval={billingInterval}
      monthlyPrice={monthlyPrice}
      isCurrentPlan={isCurrentPlan}
      isScheduledPlan={isScheduledPlan}
      action={renderAction()}
    />
  );
};
