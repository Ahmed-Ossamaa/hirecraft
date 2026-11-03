"use client";

import React from "react";
import type { AdminSubscriptionResponseDtoStatus } from "@/shared/api/generated/model";

interface AdminSubscriptionStatusBadgeProps {
  status: AdminSubscriptionResponseDtoStatus | string;
}

export function AdminSubscriptionStatusBadge({
  status,
}: AdminSubscriptionStatusBadgeProps) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Cancelled
        </span>
      );
    case "EXPIRED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
          Expired
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          {status}
        </span>
      );
  }
}

