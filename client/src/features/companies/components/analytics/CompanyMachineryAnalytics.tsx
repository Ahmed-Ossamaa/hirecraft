"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { MdWorkspacePremium } from "react-icons/md";
import { useCompanySubscription } from "@/features/billing/api/useBilling";
import { Button } from "@/shared/components/ui/Button";
import { MachineryAnalyticsFilters } from "@/shared/components/analytics/MachineryAnalyticsFilters";
import { MachineryDemandChart } from "@/shared/components/analytics/MachineryDemandChart";
import { useMachineryCatalog } from "@/shared/api/use-machinery-catalog";
import { CurrentSubscriptionDtoPlanId } from "@/shared/api/generated/model";
import { useGetCompanyMachineryMetrics } from "@/shared/api/generated/company-analytics/company-analytics";
import { useAuthStore } from "@/shared/stores/auth-store";
import { getApiError } from "@/shared/utils/error";

const analyticsPlanIds: ReadonlySet<string> = new Set([
  CurrentSubscriptionDtoPlanId["professional-monthly"],
  CurrentSubscriptionDtoPlanId["professional-yearly"],
  CurrentSubscriptionDtoPlanId["enterprise-monthly"],
  CurrentSubscriptionDtoPlanId["enterprise-yearly"],
]);

export function CompanyMachineryAnalytics() {
  const companyId = useAuthStore((state) => state.organizationId);
  const {
    subscription,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useCompanySubscription();
  const [categoryId, setCategoryId] = useState("");
  const [machineId, setMachineId] = useState("");

  const hasAnalyticsAccess = analyticsPlanIds.has(subscription?.planId ?? "");
  const catalogQuery = useMachineryCatalog(
    Boolean(companyId) && hasAnalyticsAccess,
  );
  const metricsQuery = useGetCompanyMachineryMetrics(
    { machineId: machineId || undefined },
    { query: { enabled: Boolean(companyId) && hasAnalyticsAccess } },
  );

  if (!companyId) {
    return <Notice message="Your account is not associated with a company." />;
  }

  if (isSubscriptionLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isSubscriptionError || !subscription) {
    return (
      <Notice
        message={getApiError(
          subscriptionError,
          "Unable to load your company's plan.",
        )}
        action={
          <Button variant="outline" onClick={() => refetchSubscription()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!hasAnalyticsAccess) {
    return (
      <Notice
        icon={<MdWorkspacePremium className="text-2xl text-primary" />}
        title="Machine market analytics"
        message="This feature is available with Professional and Enterprise plans."
        action={
          <Link
            href="/dashboard/company/billing"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            View plans
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto mb-8 flex w-full max-w-5xl flex-col gap-6 py-2">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Machine market analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore platform-wide machinery job demand and skilled worker supply.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          These figures are platform-wide market benchmarks, not activity or
          workforce counts for your company.
        </div>

        {catalogQuery.isError ? (
          <Notice
            message={getApiError(
              catalogQuery.error,
              "Unable to load machine options.",
            )}
            action={
              <Button variant="outline" onClick={() => catalogQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : (
          <MachineryAnalyticsFilters
            categories={catalogQuery.data?.categories ?? []}
            machines={catalogQuery.data?.machines ?? []}
            isLoading={catalogQuery.isLoading}
            selectedCategoryId={categoryId}
            selectedMachineId={machineId}
            onCategoryChange={(nextCategoryId) => {
              setCategoryId(nextCategoryId);
              setMachineId("");
            }}
            onMachineChange={setMachineId}
          />
        )}

        {metricsQuery.isError ? (
          <Notice
            message={getApiError(
              metricsQuery.error,
              "Unable to load machinery statistics.",
            )}
            action={
              <Button variant="outline" onClick={() => metricsQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : (
          <MachineryDemandChart
            data={metricsQuery.data?.data}
            isLoading={metricsQuery.isLoading}
            density="compact"
          />
        )}
      </section>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 py-2">
      <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
      <div className="h-72 rounded-2xl bg-muted" />
    </div>
  );
}

function Notice({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-56 w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      {icon}
      {title && (
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      )}
      <p className="max-w-lg text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
