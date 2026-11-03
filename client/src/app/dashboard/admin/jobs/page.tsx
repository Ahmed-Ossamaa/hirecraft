"use client";

import { Suspense } from "react";
import { MdWorkOutline } from "react-icons/md";
import { TableSkeleton } from "@/shared/components/ui/TableSkeleton";
import { AdminJobsTable } from "@/features/admin/components/jobs/AdminJobsTable";

export default function AdminJobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MdWorkOutline className="text-primary text-3xl" />
          Job Moderation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review live job postings across all employers, toggle publication statuses, or permanently hard-delete listings.
        </p>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <AdminJobsTable />
      </Suspense>
    </div>
  );
}

