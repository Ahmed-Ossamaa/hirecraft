"use client";

import {
  MdPeopleOutline,
  MdCheckCircle,
  MdCancel,
  MdUndo,
} from "react-icons/md";
import { AdminRecruitmentAnalyticsResponseDto } from "@/shared/api/generated/model";
import { Skeleton } from "@/shared/components/ui/Skeleton";

interface RecruitmentStatusChartProps {
  data?: AdminRecruitmentAnalyticsResponseDto;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500",
  SHORTLISTED: "bg-blue-500",
  INTERVIEW_SCHEDULED: "bg-purple-500",
  OFFERED: "bg-indigo-500",
  OFFER_ACCEPTED: "bg-emerald-500",
  OFFER_DECLINED: "bg-orange-500",
  REJECTED: "bg-red-600",
  WITHDRAWN: "bg-rose-400",
};

export function RecruitmentStatusChart({
  data,
  isLoading,
}: RecruitmentStatusChartProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const items = data?.statusDistribution ?? [];
  const total = data?.totalApplications ?? 0;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col max-h-fit space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MdPeopleOutline className="text-primary text-xl" />
            Recruitment Status Distribution
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Current status snapshot of applications submitted in the selected
            period.
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border self-start whitespace-nowrap">
          {total.toLocaleString()} total applications
        </span>
      </div>

      {/* Outcome Snapshot Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-2.5 sm:p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-center">
          <span className="text-[11px] sm:text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
            <MdCheckCircle className="text-xs shrink-0" /> Placements
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground mt-1">
            {(data?.placementsCount ?? 0).toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 sm:p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase text-red-600 dark:text-red-400 flex items-center gap-1 truncate">
            <MdCancel className="text-xs shrink-0" /> Rejected
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground mt-1">
            {(data?.rejectedCount ?? 0).toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 sm:p-3.5 rounded-xl border border-slate-500/20 bg-slate-500/5 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1 truncate">
            <MdUndo className="text-xs shrink-0" /> Withdrawn
          </span>
          <span className="text-lg sm:text-xl font-bold text-foreground mt-1">
            {(data?.withdrawnCount ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Breakdown List */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
          No applications recorded in this period.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const barColor = STATUS_COLORS[item.status] || "bg-primary";
            return (
              <div key={item.status} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${barColor}`} />
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{item.count}</strong> (
                    {item.percentage}%)
                  </span>
                </div>

                <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
