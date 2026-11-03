"use client";

import Link from "next/link";
import {
  MdGroup,
  MdBusiness,
  MdWorkOutline,
  MdWorkspacePremium,
  MdArrowForward,
  MdRefresh,
} from "react-icons/md";
import { useGetOverviewStats } from "@/shared/api/generated/admin-analytics/admin-analytics";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Button } from "@/shared/components/ui/Button";

export function AdminOverviewStats() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useGetOverviewStats({
      query: {
        staleTime: 60 * 1000,
      },
    });

  const stats = data?.data;

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: <MdGroup className="text-2xl text-blue-500" />,
      bgIcon: "bg-blue-500/10 border-blue-500/20 text-blue-500",
      href: "/dashboard/admin/users",
      description: "Registered platform users",
    },
    {
      title: "Total Companies",
      value: stats?.totalCompanies ?? 0,
      icon: <MdBusiness className="text-2xl text-emerald-500" />,
      bgIcon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      href: "/dashboard/admin/companies",
      description: "Registered employer companies",
    },
    {
      title: "Active Jobs",
      value: stats?.activeJobs ?? 0,
      icon: <MdWorkOutline className="text-2xl text-amber-500" />,
      bgIcon: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      href: "/dashboard/admin/jobs",
      description: "Live published job postings",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
      icon: <MdWorkspacePremium className="text-2xl text-purple-500" />,
      bgIcon: "bg-purple-500/10 border-purple-500/20 text-purple-500",
      href: "/dashboard/admin/billing",
      description: "Current paying subscriptions",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time aggregate platform statistics and management shortcuts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <MdRefresh
            className={`text-base ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh Metrics
        </Button>
      </div>

      {isError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Failed to load overview metrics. Please click refresh to try again.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="p-5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <div className="text-3xl font-bold text-foreground mt-1">
                    {card.value.toLocaleString()}
                  </div>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.bgIcon}`}
              >
                {card.icon}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{card.description}</span>
              <Link
                href={card.href}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                View
                <MdArrowForward className="text-xs" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

