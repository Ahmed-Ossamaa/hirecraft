import React from "react";
import type { JobApplicationStatsDto } from "@/shared/api/generated/model";

interface ApplicantMetricsCardsProps {
  stats?: JobApplicationStatsDto;
  isLoading: boolean;
}

interface MetricStage {
  id: string;
  label: string;
  sublabel?: string;
  tooltip: string;
  count: number;
  denominator: number;
  barColor: string;
  dotColor: string;
}

export const ApplicantMetricsCards: React.FC<ApplicantMetricsCardsProps> = ({
  stats,
  isLoading,
}) => {
  const total = stats?.total ?? 0;
  const offersTotal = stats?.offers ?? 0;

  const stages: MetricStage[] = [
    {
      id: "pending",
      label: "Pending Review",
      tooltip: "Active applications pending",
      count: stats?.pending ?? 0,
      denominator: total,
      barColor: "bg-amber-500 dark:bg-amber-400",
      dotColor: "bg-amber-500",
    },
    {
      id: "in-progress",
      label: "In Progress",
      // sublabel: "Shortlisted / Interview",
      tooltip: "Active applications shortlisted or interview scheduled",
      count: stats?.inProgress ?? 0,
      denominator: total,
      barColor: "bg-blue-500 dark:bg-blue-400",
      dotColor: "bg-blue-500",
    },
    {
      id: "offers",
      label: "Offers",
      tooltip: "Active applications with offer extended, accepted or declined",
      count: stats?.offers ?? 0,
      denominator: total,
      barColor: "bg-violet-500 dark:bg-violet-400",
      dotColor: "bg-violet-500",
    },
    {
      id: "accepted",
      label: "Accepted",
      tooltip: "Offer Acceptance Rate",
      count: stats?.offersAccepted ?? 0,
      denominator: offersTotal,
      barColor: "bg-emerald-500 dark:bg-emerald-400",
      dotColor: "bg-emerald-500",
    },
  ];

  if (isLoading) {
    return (
      <section
        className="@container w-full"
        aria-label="Loading hiring pipeline summary"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-card rounded-xl border border-border/60 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-3.5 w-24 bg-muted/80 animate-pulse rounded" />
                <div className="h-2.5 w-12 bg-muted/50 animate-pulse rounded hidden @[220px]:block" />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="h-7 w-12 bg-muted/80 animate-pulse rounded" />
                <div className="h-3 w-14 bg-muted/60 animate-pulse rounded" />
              </div>
              <div className="w-full bg-muted/60 h-1 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="@container w-full"
      aria-label="Hiring pipeline summary"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stages.map((stage) => {
          const count = stage.count;
          const denominator = stage.denominator;
          const percentage =
            denominator > 0 ? Math.round((count / denominator) * 100) : 0;
          const progressWidth =
            denominator > 0
              ? Math.min(100, Math.max(0, (count / denominator) * 100))
              : 0;

          const percentageTooltip =
            stage.id === "accepted"
              ? `${percentage}% of offers (${count} of ${denominator})`
              : `${percentage}% of all applications (${count} of ${denominator}, including archived)`;

          return (
            <div
              key={stage.id}
              className="bg-card rounded-xl border border-border/60 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between gap-2.5 min-w-0"
            >
              {/* Stage Label */}
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${stage.dotColor}`}
                    aria-hidden="true"
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate cursor-help"
                    title={stage.tooltip}
                  >
                    {stage.label}
                  </span>
                </div>
              </div>

              {/* Count & Percentage */}
              <div className="flex items-baseline justify-between gap-2 min-w-0">
                <span className="text-2xl font-bold font-headline text-foreground tracking-tight">
                  {count}
                </span>
                <span
                  className="text-xs text-muted-foreground font-medium shrink-0 hover:scale-105 cursor-help"
                  title={percentageTooltip}
                >
                  {percentage}%{" "}
                  <span className="text-[10px] text-muted-foreground/70 font-normal">
                    of {denominator}
                  </span>
                </span>
              </div>

              {/* Progress Bar */}
              <div
                className="w-full bg-border/40 dark:bg-border/60 rounded-full h-1 overflow-hidden"
                role="progressbar"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={denominator}
                aria-label={`${stage.label}: ${count} applications, ${percentage}% ${stage.id === "accepted" ? "of offers" : "of all applications"}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${stage.barColor}`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
