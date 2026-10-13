import React from "react";
import { Skeleton } from "./Skeleton";

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 border-b border-border/60">
            <tr>
              <th className="px-6 py-4 font-medium text-muted-foreground w-1/3">
                <Skeleton className="h-4 w-32" />
              </th>
              <th className="px-6 py-4 font-medium text-muted-foreground w-1/4">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="px-6 py-4 font-medium text-muted-foreground w-1/4">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="px-6 py-4 font-medium text-muted-foreground text-right">
                <Skeleton className="h-4 w-12 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-md" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="px-6 py-4 text-right">
                  <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
