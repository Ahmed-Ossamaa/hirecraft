"use client";

import React from "react";

interface AdminPlanBadgeProps {
  plan?: string | null;
  className?: string;
}

/**
 * Formats machine-readable plan IDs into clean UI labels.
 */
export function formatPlanName(plan?: string | null): string {
  if (!plan) return "Free";

  const normalized = plan.toLowerCase().trim();
  switch (normalized) {
    case "professional-monthly":
      return "Pro-M";
    case "professional-yearly":
      return "Pro-Y";
    case "starter-monthly":
      return "Starter-M";
    case "starter-yearly":
      return "Starter-Y";
    case "enterprise-monthly":
      return "Enterprise-M";
    case "enterprise-yearly":
      return "Enterprise-Y";
    case "free-monthly":
    case "free-yearly":
    case "free":
      return "Free";
    default:
      return plan.charAt(0).toUpperCase() + plan.slice(1);
  }
}

/**
 * Reusable badge for displaying plan status across Admin tables and modals.
 */
export function AdminPlanBadge({ plan, className = "" }: AdminPlanBadgeProps) {
  const normalized = plan?.toLowerCase().trim() || "";
  const isFree =
    !plan ||
    normalized === "free" ||
    normalized === "free-monthly" ||
    normalized === "free-yearly";

  if (isFree) {
    return (
      <span className={`text-muted-foreground text-[11px] ${className}`}>
        Free
      </span>
    );
  }

  const label = formatPlanName(plan);

  let colorClasses =
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";

  if (normalized.startsWith("starter")) {
    colorClasses =
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  } else if (normalized.startsWith("enterprise")) {
    colorClasses =
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${colorClasses} ${className}`}
    >
      {label}
    </span>
  );
}

