"use client";

import { JobStatus } from "@/shared/api/generated/model";

interface AdminJobStatusBadgeProps {
  status: JobStatus | string;
}

export function AdminJobStatusBadge({ status }: AdminJobStatusBadgeProps) {
  switch (status) {
    case JobStatus.PUBLISHED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Published
        </span>
      );
    case JobStatus.DRAFT:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Draft
        </span>
      );
    case JobStatus.CLOSED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
          Closed
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

