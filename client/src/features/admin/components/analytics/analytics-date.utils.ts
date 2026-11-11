import type { AdminUserGrowthResponseDtoGranularity } from "@/shared/api/generated/model";

export interface PeriodLabelResult {
  title: string;
  badge: "Daily" | "Weekly" | "Monthly";
}

/**
 * Formats a time-series bucket timestamp into an informative, range-aware label and badge.
 * Handles single days, weekly spans (Monday - Sunday), and monthly labels.
 */
export function formatPeriodLabel(
  dateStr: string,
  granularity?: AdminUserGrowthResponseDtoGranularity,
): PeriodLabelResult {
  if (!dateStr) return { title: "", badge: "Daily" };
  const parts = dateStr.split("-").map(Number);

  if (granularity === "week" && parts.length >= 3) {
    const [year, month, day] = parts;
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + 6);

    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    let startPart: string;
    let endPart: string;

    if (sameYear && sameMonth) {
      startPart = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      endPart = `${end.getDate()}, ${end.getFullYear()}`;
    } else if (sameYear) {
      startPart = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      endPart = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else {
      startPart = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      endPart = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return {
      title: `${startPart} – ${endPart}`,
      badge: "Weekly",
    };
  }

  if (granularity === "month") {
    const [year, month] = parts;
    const d = new Date(year, month - 1, 1);
    return {
      title: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      badge: "Monthly",
    };
  }

  // Daily default
  if (parts.length >= 3) {
    const [year, month, day] = parts;
    const d = new Date(year, month - 1, day);
    return {
      title: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      badge: "Daily",
    };
  }

  return { title: dateStr, badge: "Daily" };
}

/**
 * Formats a time-series bucket timestamp for the X-axis tick display.
 */
export function formatAxisTick(
  dateStr: string,
  granularity?: AdminUserGrowthResponseDtoGranularity,
): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  const [year, month, day = 1] = parts;
  const d = new Date(year, month - 1, day);

  // If granularity is monthly (or date string is YYYY-MM), show "Oct '26"
  if (granularity === "month" || parts.length === 2) {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }

  // for Daily and weekly intervals show "Oct 12"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
