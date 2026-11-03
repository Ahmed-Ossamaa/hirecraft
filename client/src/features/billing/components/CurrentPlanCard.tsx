"use client";

import React from "react";
import { CurrentSubscriptionDto } from "@/shared/api/generated/model";
import { UsageMeter } from "./UsageMeter";
import { Button } from "@/shared/components/ui/Button";
import { useConfirm } from "@/shared/providers/confirm-provider";
import { useCancelCompanySubscription } from "../api/useBilling";
import {
  MdWorkOutline,
  MdPostAdd,
  MdGroup,
  MdWarning,
  MdCreditCard,
  MdCalendarToday,
} from "react-icons/md";
import { formatDate } from "@/shared/utils/date-utils";

interface CurrentPlanCardProps {
  subscription: CurrentSubscriptionDto;
  isAdmin: boolean;
  onUpgradeClick?: () => void;
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  subscription,
  isAdmin,
  onUpgradeClick,
}) => {
  const { confirm } = useConfirm();
  const cancelMutation = useCancelCompanySubscription();

  const plan = subscription.plan;
  const usage = subscription.usage;
  const isPaid = subscription.id !== null;
  const isCanceledAtEnd = subscription.cancelAtPeriodEnd;



  const handleCancel = async () => {
    const isConfirmed = await confirm({
      title: "Cancel Subscription",
      message: `Are you sure you want to cancel your ${plan?.name || "current"} subscription? Your paid features and allowances will remain active until ${formatDate(subscription.currentPeriodEnd)}, after which your account will return to the Free plan.`,
      confirmText: "Yes, Cancel Subscription",
      cancelText: "Keep Subscription",
      variant: "danger",
    });

    if (isConfirmed) {
      await cancelMutation.mutateAsync();
    }
  };

  const limits = plan?.limits ?? {
    maxActiveJobs: 1,
    maxJobPostings: 1,
    maxUsers: 1,
  };

  return (
    <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
              {plan?.name || "Free"} Plan
            </h2>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
                subscription.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}
            >
              {subscription.status}
            </span>

            {isPaid && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                {plan?.interval || "monthly"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground pt-1">
            {subscription.currentPeriodEnd && (
              <div className="flex items-center gap-1.5">
                <MdCalendarToday className="text-sm" />
                <span>
                  {isCanceledAtEnd ? "Access expires on" : "Renews on"}:{" "}
                  <strong className="text-foreground font-mono">
                    {formatDate(subscription.currentPeriodEnd)}
                  </strong>
                </span>
              </div>
            )}

            {isPaid && (
              <div className="flex items-center gap-1.5">
                <MdCreditCard className="text-sm" />
                <span>Standard Card Billing</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdmin ? (
            <>
              {isPaid && !isCanceledAtEnd && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 text-xs"
                >
                  {cancelMutation.isPending ? "Canceling..." : "Cancel Plan"}
                </Button>
              )}

              {onUpgradeClick && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onUpgradeClick}
                  className="text-xs"
                >
                  {isPaid ? "Change Plan" : "Upgrade Plan"}
                </Button>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Billing managed by Company Admins
            </span>
          )}
        </div>
      </div>
      
      {/* Scheduled Downgrade Banner */}
      {subscription.scheduledPlan && !isCanceledAtEnd && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <MdWarning className="text-xl shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold block text-sm">
              Subscription Scheduled for Downgrade
            </span>
            Your subscription is scheduled to downgrade to the{" "}
            <strong>{subscription.scheduledPlan.name}</strong> plan on{" "}
            <strong>{formatDate(subscription.currentPeriodEnd)}</strong>. You
            retain full access to your current {plan?.name} allowances and features
            until that date.
          </div>
        </div>
      )}

      {/* Cancellation Banner */}
      {isCanceledAtEnd && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <MdWarning className="text-xl shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold block text-sm">
              Subscription Scheduled for Cancellation
            </span>
            Your subscription has been canceled and will not renew. You retain
            full access to your current allowances and features until{" "}
            <strong>{formatDate(subscription.currentPeriodEnd)}</strong>.
          </div>
        </div>
      )}

      {/* Resource Consumption Meters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
            Plan Capacity & Utilization
          </h3>
          <span className="text-xs text-muted-foreground">
            Current billing cycle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UsageMeter
            label="Active Published Jobs"
            used={usage?.activeJobs ?? 0}
            max={limits.maxActiveJobs}
            unit="jobs"
            description="Simultaneously published jobs visible to candidates."
            icon={<MdWorkOutline />}
          />

          <UsageMeter
            label="Posting Credits Consumed"
            used={usage?.jobPostingsUsed ?? 0}
            max={limits.maxJobPostings}
            unit="posts"
            description={`Posting allowance for this period. Resets on ${formatDate(
              subscription.currentPeriodEnd,
            )}.`}
            icon={<MdPostAdd />}
          />

          <UsageMeter
            label="Team Member Seats"
            used={usage?.teamMembersCount ?? 0}
            max={limits.maxUsers}
            unit="seats"
            description="Active team members plus pending email invitations."
            icon={<MdGroup />}
          />
        </div>
      </div>
    </div>
  );
};
