"use client";

import React, { useState } from "react";
import { useGetMyApplications } from "@/shared/api/generated/job-applications/job-applications";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { Button, Pagination } from "@/shared/components/ui";
import { MdWorkOutline, MdLocationOn } from "react-icons/md";
import Link from "next/link";
import { formatTimeAgo } from "@/shared/lib/formatTimeAgo";
import { JobApplication } from "@/shared/api/generated/model";

export const ApplicationsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useGetMyApplications({
    page,
    limit,
  });

  if (isLoading) {
    return (
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm flex items-center justify-center min-h-75">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
        <p className="text-red-500 mb-2">Failed to load applications.</p>
        <p className="text-sm text-muted-foreground">
          {(error as any)?.response?.data?.message || "Please try again later."}
        </p>
      </div>
    );
  }

  const applications: JobApplication[] = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;

  if (applications.length === 0) {
    return (
      <div className="bg-card p-12 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MdWorkOutline className="text-3xl text-primary" />
        </div>
        <h3 className="text-xl font-headline font-semibold text-foreground mb-2">
          No Applications Yet
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          You haven't applied to any jobs yet. Browse available jobs and start
          your industrial career journey.
        </p>
        <Link href="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 ">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-card px-2 md:px-5  py-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <h3 className="font-headline font-semibold text-xs sm:text-base md:text-lg text-foreground hover:text-primary transition-colors wrap-break-word">
                    <Link href={`/jobs?jobid=${app.jobId}`}>
                      {app.jobTitle || "Job Application"}
                    </Link>
                  </h3>
                  <div className="shrink-0 text-xs sm:text-base">
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                </div>

                <div className="flex items-center text-xs text-muted-foreground mb-3 flex-wrap gap-2">
                  <span>Applied {formatTimeAgo(app.createdAt)}</span>
                </div>

                {app.coverLetter && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Your Cover Letter:
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 italic wrap-break-word">
                      "{app.coverLetter}"
                    </p>
                  </div>
                )}
              </div>

              <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <Link
                  href={`/jobs?jobId=${app.jobId}`}
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    View Job
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 0 && (
        <div className="flex justify-center items-center pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
