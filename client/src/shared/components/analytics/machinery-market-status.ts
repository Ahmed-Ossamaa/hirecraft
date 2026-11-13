import type { AdminMachineSupplyDemandItemDtoMarketStatus } from "@/shared/api/generated/model";

export const marketStatusLabels: Record<
  AdminMachineSupplyDemandItemDtoMarketStatus,
  string
> = {
  SHORTAGE: "Talent Shortage",
  BALANCED: "Balanced",
  SURPLUS: "Talent Surplus",
};

export const marketStatusClasses: Record<
  AdminMachineSupplyDemandItemDtoMarketStatus,
  string
> = {
  SHORTAGE:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 whitespace-nowrap",
  BALANCED:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 whitespace-nowrap",
  SURPLUS:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 whitespace-nowrap",
};
