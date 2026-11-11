"use client";

import { MdPrecisionManufacturing } from "react-icons/md";
import { AdminMachineryAnalyticsResponseDto } from "@/shared/api/generated/model";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { cn } from "@/shared/utils/utils";

interface MachineryDemandChartProps {
  data?: AdminMachineryAnalyticsResponseDto;
  isLoading: boolean;
}

export function MachineryDemandChart({
  data,
  isLoading,
}: MachineryDemandChartProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2">
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
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col  gap-2 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MdPrecisionManufacturing className="text-amber-500 text-xl" />
            Machinery Demand vs. Worker Supply
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active jobs vs. distinct candidates skilled on each machine.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs ml-1  font-medium">
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

      {/* Machines List */}
      {machines.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
          No machinery demand data recorded.
        </div>
      ) : (
        <div className="space-y-3">
          {machines.map((m) => {
            const maxVal = Math.max(
              m.activeJobsDemand,
              m.distinctWorkersSupply,
              1,
            );
            const demandWidth = `${(m.activeJobsDemand / maxVal) * 100}%`;
            const supplyWidth = `${(m.distinctWorkersSupply / maxVal) * 100}%`;

            let badgeClass = "bg-muted text-muted-foreground border-border";
            let statusText = "Balanced Supply";

            if (m.marketStatus === "SHORTAGE") {
              badgeClass =
                "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 whitespace-nowrap";
              statusText = "Talent Shortage";
            } else if (m.marketStatus === "SURPLUS") {
              badgeClass =
                "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 whitespace-nowrap";
              statusText = "Talent Surplus";
            } else {
              badgeClass =
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 whitespace-nowrap";
              statusText = "Balanced";
            }

            return (
              <div
                key={m.machineId}
                className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-card-hover transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{m.nameEn}</p>
                    <span className="text-muted-foreground text-xs">
                      ({m.categoryEn})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.supplyToDemandRatio !== null && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {m.supplyToDemandRatio}x ratio
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium border",
                        badgeClass,
                      )}
                    >
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Bars comparison */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-muted-foreground">
                      Jobs: {m.activeJobsDemand}
                    </span>
                    <div className="flex-1 bg-muted/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: demandWidth }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-muted-foreground">
                      Technicians: {m.distinctWorkersSupply}
                    </span>
                    <div className="flex-1 bg-muted/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: supplyWidth }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
