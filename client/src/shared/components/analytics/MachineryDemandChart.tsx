"use client";

import { MdPrecisionManufacturing } from "react-icons/md";
import type { AdminMachineryAnalyticsResponseDto } from "@/shared/api/generated/model";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { cn } from "@/shared/utils/utils";
import {
  marketStatusClasses,
  marketStatusLabels,
} from "./machinery-market-status";

export interface MachineryDemandChartProps {
  data?: AdminMachineryAnalyticsResponseDto;
  isLoading: boolean;
  density?: "default" | "compact";
}

export function MachineryDemandChart({
  data,
  isLoading,
  density = "default",
}: MachineryDemandChartProps) {
  const isCompact = density === "compact";

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card shadow-xs space-y-2",
          isCompact ? "p-4" : "p-6",
        )}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const machines = data?.machines ?? [];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between",
        isCompact ? "p-4 space-y-3" : "p-6 space-y-4",
      )}
    >
      <div className="flex flex-col gap-2 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MdPrecisionManufacturing className="text-amber-500 text-xl" />
            Machinery Demand vs. Worker Supply
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active jobs vs. distinct candidates skilled on each machine.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs ml-1 font-medium">
          <div className="flex items-center gap-1.5 text-blue-500">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Open Jobs (Demand)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Skilled Technicians (Supply)</span>
          </div>
        </div>
      </div>

      {machines.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
          No machinery demand data recorded.
        </div>
      ) : (
        <div className={cn(isCompact ? "space-y-2" : "space-y-3")}>
          {machines.map((machine) => {
            const maxValue = Math.max(
              machine.activeJobsDemand,
              machine.distinctWorkersSupply,
              1,
            );
            const demandWidth = `${(machine.activeJobsDemand / maxValue) * 100}%`;
            const supplyWidth = `${(machine.distinctWorkersSupply / maxValue) * 100}%`;

            return (
              <div
                key={machine.machineId}
                className={cn(
                  "rounded-xl border border-border/80 bg-card hover:bg-card-hover transition-colors space-y-2.5",
                  isCompact ? "p-2.5" : "p-3.5",
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">
                      {machine.nameEn}
                    </p>
                    <span className="text-muted-foreground text-xs">
                      ({machine.categoryEn})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {machine.supplyToDemandRatio !== null && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {machine.supplyToDemandRatio}x ratio
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium border",
                        marketStatusClasses[machine.marketStatus],
                      )}
                    >
                      {marketStatusLabels[machine.marketStatus]}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <MetricBar
                    label="Jobs"
                    value={machine.activeJobsDemand}
                    width={demandWidth}
                    color="bg-blue-500"
                  />
                  <MetricBar
                    label="Technicians"
                    value={machine.distinctWorkersSupply}
                    width={supplyWidth}
                    color="bg-emerald-500"
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

function MetricBar({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: number;
  width: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-muted-foreground">
        {label}: {value}
      </span>
      <div className="flex-1 bg-muted/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-300`}
          style={{ width }}
        />
      </div>
    </div>
  );
}
