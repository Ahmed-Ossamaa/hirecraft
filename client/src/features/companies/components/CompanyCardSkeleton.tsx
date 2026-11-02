"use client";

import React from "react";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export const CompanyCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden animate-pulse">
      {/* Cover Skeleton */}
      <div className="h-28 sm:h-32 w-full bg-card-hover/80" />

      {/* Logo Skeleton */}
      <div className="px-5 -mt-8 relative z-10">
        <Skeleton className="w-16 h-16 rounded-xl border-2 border-card" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 pt-3 flex flex-col flex-1 justify-between">
        <div className="space-y-3">
          {/* Title */}
          <Skeleton className="h-5 w-3/4 rounded-md" />

          {/* Industry */}
          <Skeleton className="h-4 w-1/2 rounded-md" />

          {/* Location */}
          <Skeleton className="h-3.5 w-2/5 rounded-md" />
        </div>

        {/* Button */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};
