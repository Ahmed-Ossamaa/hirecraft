import React from "react";

export const EditJobSkeleton: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6 animate-pulse">
      {/* Basic details skeleton */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-10 w-full bg-muted/60 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-24 w-full bg-muted/60 rounded-xl" />
        </div>
      </div>

      {/* Machine & Experience skeleton */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-muted/60 rounded-xl" />
          <div className="h-10 bg-muted/60 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-muted/60 rounded-xl" />
          <div className="h-10 bg-muted/60 rounded-xl" />
        </div>
      </div>

      {/* Location skeleton */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <div className="h-6 w-44 bg-muted rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-muted/60 rounded-xl" />
          <div className="h-10 bg-muted/60 rounded-xl" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
        <div className="h-10 w-24 bg-muted rounded-xl" />
        <div className="h-10 w-32 bg-muted rounded-xl" />
      </div>
    </div>
  );
};

export default EditJobSkeleton;
