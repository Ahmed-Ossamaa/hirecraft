"use client";

import { MdWorkspacePremium, MdInfoOutline } from "react-icons/md";
import { AdminRevenueAnalyticsResponseDto } from "@/shared/api/generated/model";
import { Skeleton } from "@/shared/components/ui/Skeleton";

interface RevenueAnalyticsCardProps {
  data?: AdminRevenueAnalyticsResponseDto;
  isLoading: boolean;
}

export function RevenueAnalyticsCard({
  data,
  isLoading,
}: RevenueAnalyticsCardProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const plans = data?.planDistribution ?? [];
  const currency = data?.currency ?? "EGP";

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MdWorkspacePremium className="text-purple-500 text-xl" />
            Recurring Subscription Health
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Current subscription tiers and recurring MRR commitments.
          </p>
        </div>
      </div>

      {/* Primary MRR / ARR Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Recurring (MRR)
          </span>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {currency} {(data?.currentMrr ?? 0).toLocaleString()}
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            Normalized monthly rate across active paid plans
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Annual Run-Rate (ARR)
          </span>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {currency} {(data?.currentArr ?? 0).toLocaleString()}
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            {data?.activePaidSubscriptions ?? 0} active paying subscriptions
          </span>
        </div>
      </div>

      {/* Plan Distribution List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Plan Tier Breakdown
        </h3>

        {plans.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
            No active paying subscriptions currently registered.
          </div>
        ) : (
          <div className="space-y-2.5">
            {plans.map((plan) => (
              <div
                key={plan.planId}
                className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-card-hover transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {plan.planName}
                    </span>
                    <span className="text-xs px-2 ml-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {plan.subscriberCount}{" "}
                      {plan.subscriberCount === 1 ? "company" : "companies"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-foreground">
                      {currency}{" "}
                      {plan.monthlyRevenueContribution.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs"> / mo</span>
                  </div>
                </div>

                {/* Progress bar of revenue percentage */}
                <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(plan.revenuePercentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 text-xs text-muted-foreground/80 flex items-center gap-1.5">
        <MdInfoOutline className="text-xs shrink-0" />
        <span>
          Excludes Free and Cancelled plans. Reflects subscription contractual
          value rather than historical cash deposits.
        </span>
      </div>
    </div>
  );
}
