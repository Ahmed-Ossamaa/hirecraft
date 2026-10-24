"use client";

import React from "react";
import { MdCheck, MdStars } from "react-icons/md";
import clsx from "clsx";
import type { Plan } from "@/shared/api/generated/model";
import { getPlanDescription, getPlanFeatures } from "../utils/plan-features";
import {
  calculateAnnualSavingsPercent,
  formatPlanPriceDisplay,
} from "../utils/plan-pricing";

export interface PlanCardViewProps {
  plan: Plan;
  billingInterval: "month" | "year";
  monthlyPrice?: number;
  isCurrentPlan?: boolean;
  isScheduledPlan?: boolean;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * subscription plan card.
 */
export const PlanCardView: React.FC<PlanCardViewProps> = ({
  plan,
  billingInterval,
  monthlyPrice,
  isCurrentPlan = false,
  isScheduledPlan = false,
  badge,
  action,
  className,
}) => {
  const planNameLower = plan.name.toLowerCase();
  const isPro = planNameLower === "pro" || planNameLower === "professional";

  const discountPercent = React.useMemo(() => {
    if (billingInterval !== "year") return 0;
    return calculateAnnualSavingsPercent(monthlyPrice, plan.price);
  }, [billingInterval, monthlyPrice, plan.price]);

  const { formattedPrice, period, subtext } = formatPlanPriceDisplay(
    plan,
    billingInterval,
    discountPercent,
  );

  const description = getPlanDescription(plan);
  const features = getPlanFeatures(plan, billingInterval);

  return (
    <div
      className={clsx(
        "relative rounded-2xl flex flex-col justify-between p-6 sm:p-7 transition-all duration-300",
        isCurrentPlan
          ? "bg-card border-2 border-primary shadow-lg ring-4 ring-primary/5"
          : isPro
            ? "bg-card border border-primary/40 shadow-md hover:border-primary/70"
            : "bg-card/70 border border-border/70 hover:border-border hover:shadow-sm",
        className,
      )}
    >
      {/* Badges / Pill Header */}
      {badge !== undefined ? (
        badge
      ) : (
        <>
          {isCurrentPlan && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-sm whitespace-nowrap">
              Current Plan
            </div>
          )}

          {isScheduledPlan && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-amber-950 text-[11px] font-bold tracking-wider uppercase shadow-sm whitespace-nowrap">
              Downgrade Scheduled
            </div>
          )}

          {isPro && !isCurrentPlan && !isScheduledPlan && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <MdStars className="text-sm" /> Recommended
            </div>
          )}
        </>
      )}

      <div>
        {/* Tier Header */}
        <div className="mb-4">
          <h3 className="text-xl font-headline font-semibold text-foreground tracking-tight">
            {plan.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
            {description}
          </p>
        </div>

        {/* Pricing block */}
        <div className="my-5 pb-5 border-b border-border/50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono tracking-tight">
              {formattedPrice}
            </span>
            {period && (
              <span className="text-xs text-muted-foreground font-medium">
                {period}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-xs text-emerald-500 font-semibold mt-1">
              {subtext}
            </p>
          )}
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
            Included Features
          </span>
          <ul className="space-y-2.5">
            {features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-foreground/90"
              >
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MdCheck className="text-xs" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
