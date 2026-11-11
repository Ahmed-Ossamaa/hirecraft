"use client";

import { MdRefresh } from "react-icons/md";
import { Button } from "@/shared/components/ui/Button";
import { GetOverviewStatsRange } from "@/shared/api/generated/model";

interface AnalyticsTimeRangeSelectorProps {
  selectedRange: GetOverviewStatsRange;
  onRangeChange: (range: GetOverviewStatsRange) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const RANGE_OPTIONS: { label: string; value: GetOverviewStatsRange }[] = [
  { label: "7 Days", value: GetOverviewStatsRange["7d"] },
  { label: "30 Days", value: GetOverviewStatsRange["30d"] },
  { label: "90 Days", value: GetOverviewStatsRange["90d"] },
  { label: "12 Months", value: GetOverviewStatsRange["12m"] },
  { label: "All Time", value: GetOverviewStatsRange.all },
];

export function AnalyticsTimeRangeSelector({
  selectedRange,
  onRangeChange,
  onRefresh,
  isRefreshing = false,
}: AnalyticsTimeRangeSelectorProps) {
  return (
    <div className="flex  items-center justify-between gap-3 whitespace-nowrap">
      <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border shadow-xs">
        {RANGE_OPTIONS.map((opt) => {
          const isActive = selectedRange === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRangeChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Refresh Analytics Data"
        className="flex items-center cursor-pointer p-2 group"
      >
        <MdRefresh
          className={`text-base text-primary group-hover:rotate-90  ${isRefreshing ? "animate-spin" : ""}`}
        />
      </Button>
    </div>
  );
}
