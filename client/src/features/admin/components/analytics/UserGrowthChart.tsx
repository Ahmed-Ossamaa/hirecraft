"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  AdminUserGrowthResponseDto,
  AdminUserGrowthResponseDtoGranularity,
} from "@/shared/api/generated/model";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { MdTrendingUp, MdPerson, MdBusiness } from "react-icons/md";
import { formatPeriodLabel, formatAxisTick } from "./analytics-date.utils";

interface UserGrowthChartProps {
  data?: AdminUserGrowthResponseDto;
  isLoading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  granularity?: AdminUserGrowthResponseDtoGranularity;
}

function CustomTooltip({
  active,
  payload,
  label,
  granularity,
}: CustomTooltipProps) {
  if (active && payload && payload.length && label) {
    const period = formatPeriodLabel(label, granularity);
    const total = payload.reduce((acc, p) => acc + (p.value ?? 0), 0);

    return (
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md p-3 shadow-lg text-xs space-y-2 min-w-48">
        <div className="border-b border-border/60 pb-1.5 flex items-center justify-between gap-2">
          <span className="font-semibold text-foreground">{period.title}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
            {period.badge}
          </span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-between gap-3"
            >
              <span
                className="flex items-center gap-1.5 capitalize font-medium"
                style={{ color: entry.color }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-foreground">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 pt-1.5 flex items-center justify-between text-muted-foreground font-semibold">
          <span>Total:</span>
          <span className="text-foreground">{total.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function UserGrowthChart({ data, isLoading }: UserGrowthChartProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-72 sm:h-80 w-full rounded-xl" />
      </div>
    );
  }

  const points = data?.points ?? [];
  const summary = data?.summary;
  const granularity = data?.granularity;

  const granularityLabel =
    granularity === "week"
      ? "Weekly"
      : granularity === "month"
        ? "Monthly"
        : "Daily";

  const subtitle =
    granularity === "week"
      ? "Weekly registration progression of Candidates and Employers joined over time."
      : granularity === "month"
        ? "Monthly registration progression of Candidates and Employers joined over time."
        : "Daily registration progression of Candidates and Employers joined over time.";

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MdTrendingUp className="text-primary text-xl" />
              User Registration Velocity
            </h2>
            {granularity && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                {granularityLabel} View
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
            <MdPerson className="text-sm" />
            <span>
              +{(summary?.candidatesNew ?? 0).toLocaleString()} Candidates
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
            <MdBusiness className="text-sm" />
            <span>
              +{(summary?.employersNew ?? 0).toLocaleString()} Employers
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {points.length === 0 ? (
        <div className="h-72 sm:h-80 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          No registration activity recorded in this period.
        </div>
      ) : (
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorCandidates"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorEmployers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-border/60"
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatAxisTick(val, granularity)}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
                dy={8}
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
              />

              <Tooltip content={<CustomTooltip granularity={granularity} />} />

              <Area
                type="monotone"
                dataKey="candidates"
                name="Candidates"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCandidates)"
              />

              <Area
                type="monotone"
                dataKey="employers"
                name="Employers"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEmployers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
