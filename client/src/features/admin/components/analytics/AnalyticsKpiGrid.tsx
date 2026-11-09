"use client";

import {
  MdAttachMoney,
  MdGroup,
  MdWorkOutline,
  MdCheckCircle,
} from "react-icons/md";

import { AdminKpiMetricsDto } from "@/shared/api/generated/model";
import { AdminKpiGridSkeleton } from "../shared/AdminKpiCard-skeleton";
import { AdminKpiCard } from "../shared/AdminKpiCard";

interface AnalyticsKpiGridProps {
  metrics?: AdminKpiMetricsDto;
  isLoading: boolean;
}

export function AnalyticsKpiGrid({
  metrics,
  isLoading,
}: AnalyticsKpiGridProps) {
  if (isLoading) {
    return <AdminKpiGridSkeleton />;
  }

  const currency = metrics?.currency ?? "EGP";

  const kpiCards = [
    {
      title: "Current MRR",
      value: `${currency} ${(metrics?.currentMrr ?? 0).toLocaleString()}`,
      icon: <MdAttachMoney className="text-xl" />,
      iconClassName: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      footer: (
        <>
          <span className="text-muted-foreground">
            ARR: {currency} {(metrics?.currentArr ?? 0).toLocaleString()}
          </span>
          <span className="px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border">
            {metrics?.activePaidSubscriptions ?? 0} active paid
          </span>
        </>
      ),
    },
    {
      title: "Total Users",
      value: (metrics?.totalUsers ?? 0).toLocaleString(),
      delta: metrics?.usersPeriodDelta,
      icon: <MdGroup className="text-xl" />,
      iconClassName: "bg-blue-500/10 border-blue-500/20 text-blue-500",
      footer: (
        <div className="flex justify-between w-full text-muted-foreground">
          <span>New in period:</span>
          <span className="font-semibold text-foreground">
            +{(metrics?.newUsersInPeriod ?? 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      title: "Active Jobs",
      value: (metrics?.activeJobs ?? 0).toLocaleString(),
      delta: metrics?.jobsPeriodDelta,
      icon: <MdWorkOutline className="text-xl" />,
      iconClassName: "bg-amber-500/10 border-amber-500/20 text-amber-500",
      footer: (
        <div className="flex justify-between w-full text-muted-foreground">
          <span>Published in period:</span>
          <span className="font-semibold text-foreground">
            +{(metrics?.newJobsInPeriod ?? 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      title: "Hires Placed",
      value: (metrics?.placementsInPeriod ?? 0).toLocaleString(),
      delta: metrics?.placementsPeriodDelta,
      icon: <MdCheckCircle className="text-xl" />,
      iconClassName: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      footer: (
        <div className="flex justify-between w-full text-muted-foreground">
          <span>Applications in period:</span>
          <span className="font-semibold text-foreground">
            {(metrics?.totalApplicationsInPeriod ?? 0).toLocaleString()}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card) => (
        <AdminKpiCard key={card.title} {...card} />
      ))}
    </div>
  );
}
