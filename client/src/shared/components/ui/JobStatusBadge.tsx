"use client";

import React from "react";
import { JobStatus } from "@/shared/api/generated/model";

export const getStatusBadgeStyle = (status?: string) => {
  switch (status) {
    case "PUBLISHED":
    case JobStatus.PUBLISHED:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "DRAFT":
    case JobStatus.DRAFT:
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "CLOSED":
    case JobStatus.CLOSED:
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground border-border/60";
  }
};

interface JobStatusBadgeProps {
  status?: JobStatus | string;
  className?: string;
}

export function JobStatusBadge({ status, className = "" }: JobStatusBadgeProps) {
  const displayStatus = status ? status.toUpperCase() : "UNKNOWN";
  const label =
    displayStatus === "PUBLISHED"
      ? "Published"
      : displayStatus === "DRAFT"
      ? "Draft"
      : displayStatus === "CLOSED"
      ? "Closed"
      : displayStatus;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-md border tracking-wide select-none ${getStatusBadgeStyle(
        status,
      )} ${className}`}
    >
      {label}
    </span>
  );
}

