import { Skeleton } from "@/shared/components/ui/Skeleton";

export function AdminKpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>

          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
}
