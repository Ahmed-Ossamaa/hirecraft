"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MdBookmark,
  MdLocationOn,
  MdAttachMoney,
  MdPrecisionManufacturing,
  MdWorkOutline,
  MdArrowForward,
  MdBusiness,
} from "react-icons/md";
import {
  useSavedJobs,
  useToggleSaveJob,
} from "@/features/jobs/api/useSavedJobs";
import { Button, Pagination, EmptyState } from "@/shared/components/ui";
import { formatTimeAgo } from "@/shared/utils/date-utils";
import type { SavedJobResponseDto } from "@/shared/api/generated/model";

export const SavedJobsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { savedJobs, total, totalPages, isLoading, isError, error } =
    useSavedJobs({
      page,
      limit,
    });

  const { unsaveJob, isPending } = useToggleSaveJob();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleUnsave = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemovingId(jobId);
    try {
      await unsaveJob(jobId);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm animate-pulse flex flex-col md:flex-row gap-4 justify-between"
          >
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-input rounded-md w-2/3" />
              <div className="h-4 bg-input rounded-md w-1/3" />
              <div className="flex gap-2">
                <div className="h-6 bg-input rounded w-20" />
                <div className="h-6 bg-input rounded w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3 w-48 shrink-0">
              <div className="h-10 bg-input rounded-lg flex-1" />
              <div className="h-10 w-10 bg-input rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
        <p className="text-red-500 font-medium mb-1">
          Failed to load saved jobs.
        </p>
        <p className="text-sm text-muted-foreground">
          {(error as any)?.response?.data?.message || "Please try again later."}
        </p>
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <EmptyState
        icon={<MdBookmark className="text-3xl text-primary" />}
        iconWrapperClassName="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
        title="No Saved Jobs Yet"
        description="Keep track of roles you're interested in. Save jobs from the browse jobs page to quickly review and apply later."
        actionText="Browse Jobs"
        actionHref="/jobs"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{total}</span>{" "}
          saved {total === 1 ? "role" : "roles"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {savedJobs.map((item: SavedJobResponseDto) => {
          const job = item.job;
          const isRemoving = removingId === item.jobId;

          return (
            <div
              key={item.id}
              className="group bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Job Information */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-3">
                    {/* Company Logo or Initials */}
                    {job?.companyLogo ? (
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-border bg-input shrink-0 mt-0.5">
                        <Image
                          src={job.companyLogo}
                          alt={job.companyName || "Company Logo"}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl border border-border bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 mt-0.5">
                        <MdBusiness className="text-xl" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-headline font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors truncate">
                        <Link href={`/jobs?jobId=${item.jobId}`}>
                          {job?.title || "Job Opportunity"}
                        </Link>
                      </h3>

                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground font-medium flex-wrap gap-x-2 gap-y-1 mt-0.5">
                        <span>{job?.companyName || "Unknown Company"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MdLocationOn className="shrink-0 text-muted-foreground" />
                          {job?.city}, {job?.country}
                        </span>
                        <span>•</span>
                        <span className="text-xs text-muted-foreground/80 font-mono">
                          Saved {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 pt-1 pl-0 sm:pl-14">
                    {job?.jobType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-input border border-border text-[11px] font-mono text-foreground uppercase">
                        <MdWorkOutline className="text-primary text-xs" />
                        {job.jobType}
                      </span>
                    )}

                    {job?.machineNameEn && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card-hover border border-border text-[11px] font-mono text-foreground uppercase">
                        <MdPrecisionManufacturing className="text-primary text-xs" />
                        {job.machineNameEn}
                      </span>
                    )}

                    {job?.salaryRange && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
                        <MdAttachMoney className="text-xs text-emerald-600 dark:text-emerald-400" />
                        {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-center w-full sm:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 m-0"
                    onClick={(e) => handleUnsave(item.jobId, e)}
                    disabled={isPending || isRemoving}
                    title="Remove from saved jobs"
                    aria-label="Remove from saved jobs"
                  >
                    <MdBookmark className="text-lg text-primary  hover:text-red-500 p-0" />
                  </Button>

                  <Link
                    href={`/jobs?jobId=${item.jobId}`}
                    className="flex-1 sm:flex-initial"
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto"
                      rightIcon={<MdArrowForward className="text-sm" />}
                    >
                      View & Apply
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
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
