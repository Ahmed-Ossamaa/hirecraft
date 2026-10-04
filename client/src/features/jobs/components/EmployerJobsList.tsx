"use client";

import React, { useState, useEffect, useTransition } from "react";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui";
import {
  MdAdd,
  MdWorkOutline,
  MdSearch,
  MdPeopleOutline,
  MdClose,
} from "react-icons/md";
import Link from "next/link";
import { formatTimeAgo } from "@/shared/lib/formatTimeAgo";
import { useRouter, useSearchParams } from "next/navigation";
import { JobDetailsModal } from "./JobDetailsModal";
import { JobActionMenu } from "./JobActionMenu";
import { EmptyState, Tabs } from "@/shared/components/ui";

interface EmployerJobsListProps {
  initialJobs: JobWithStatsDto[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}


export const EmployerJobsList: React.FC<EmployerJobsListProps> = ({
  initialJobs,
  meta,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "ALL";
  const currentSearch = searchParams.get("search") || "";
  const currentSortBy = searchParams.get("sortBy") || "";
  const currentSortOrder = searchParams.get("order") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [selectedJob, setSelectedJob] = useState<JobWithStatsDto | null>(null);

  // Debounced Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateFilters({ search: searchValue, page: 1 });
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue, currentSearch]);

  const updateFilters = (updates: {
    status?: string;
    search?: string;
    page?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.status !== undefined) {
      if (updates.status === "ALL") {
        params.delete("status");
      } else {
        params.set("status", updates.status);
      }
      params.delete("page"); // Reset page on status change
    }

    if (updates.search !== undefined) {
      if (updates.search) {
        params.set("search", updates.search);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset page on search change
    }

    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set("page", updates.page.toString());
      } else {
        params.delete("page");
      }
    }

    if (updates.sortBy !== undefined) {
      if (updates.sortBy) {
        params.set("sortBy", updates.sortBy);
      } else {
        params.delete("sortBy");
      }
    }

    if (updates.sortOrder !== undefined) {
      if (updates.sortOrder) {
        params.set("order", updates.sortOrder);
      } else {
        params.delete("order");
      }
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleSort = (field: string) => {
    if (currentSortBy === field) {
      // Toggle order
      if (currentSortOrder === "ASC") {
        updateFilters({ sortBy: field, sortOrder: "DESC", page: 1 });
      } else {
        updateFilters({ sortBy: field, sortOrder: "ASC", page: 1 });
      }
    } else {
      updateFilters({ sortBy: field, sortOrder: "ASC", page: 1 });
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (currentSortBy !== field) {
      return <span className="opacity-0 group-hover:opacity-30 ml-1">↕</span>;
    }
    return <span className="ml-1 text-primary">{currentSortOrder === "ASC" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Tabs
            tabs={[
              { id: "ALL", label: "All Jobs" },
              { id: "PUBLISHED", label: "Published" },
              { id: "DRAFT", label: "Draft" },
              { id: "CLOSED", label: "Closed" },
            ]}
            activeTab={currentStatus}
            onTabChange={(id) => updateFilters({ status: id })}
          />
          <Link
            href="/dashboard/company/jobs/create"
            className="shrink-0 mb-2 ml-4"
          >
            <Button size="sm" leftIcon={<MdAdd className="text-lg" />}>
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Search Toolbar */}
        <div className="flex items-center gap-3 w-full bg-card p-1.5 rounded-xl border border-border/40 shadow-sm focus-within:border-primary/50 transition-colors">
          <div className="flex items-center flex-1 gap-2 px-3">
            <MdSearch className="text-muted-foreground text-xl" />
            <input
              type="text"
              placeholder="Search jobs by title or machine name"
              className="bg-transparent border-none outline-none text-sm w-full py-1.5 text-foreground placeholder:text-muted-foreground"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <MdClose />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div
        className={`bg-card rounded-xl border border-border/40 shadow-sm transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="overflow-x-auto pb-48 lg:pb-0 lg:overflow-visible">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Job Title
                </th>
                <th className="px-5 py-3 font-medium cursor-pointer group hover:text-foreground transition-colors" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-5 py-3 font-medium">
                  Type & Experience
                </th>
                <th className="px-5 py-3 font-medium text-center cursor-pointer group hover:text-foreground transition-colors" onClick={() => handleSort('applicants')}>
                  Applicants <SortIcon field="applicants" />
                </th>
                <th className="px-5 py-3 font-medium cursor-pointer group hover:text-foreground transition-colors" onClick={() => handleSort('date')}>
                  Posted <SortIcon field="date" />
                </th>
                <th className="px-5 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {initialJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <td className="px-5 py-3.5 align-middle">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="font-medium text-foreground hover:text-primary transition-colors text-[15px] text-left cursor-pointer"
                    >
                      {job.title}
                    </button>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {job.machineNameEn || "General Machine"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border tracking-wide ${
                        job.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : job.status === "DRAFT"
                            ? "bg-muted text-muted-foreground border-border/60"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-sm text-foreground">
                    <div className="text-foreground">{job.jobType}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      {job.experienceLevel}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-center">
                    <Link
                      href={`/dashboard/company/jobs/${job.id}/applicants`}
                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      <span className="text-base">
                        {job.applicationCount || 0}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 align-middle text-muted-foreground text-sm">
                    {formatTimeAgo(job.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/company/jobs/${job.id}/applicants`}
                      >
                        <Button
                          size="sm"
                          leftIcon={<MdPeopleOutline className="text-xs" />}
                        >
                          Applicants
                        </Button>
                      </Link>
                      <JobActionMenu job={job} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {initialJobs.length === 0 && (
          <EmptyState
            icon={<MdWorkOutline className="text-3xl" />}
            title="No jobs found"
            description="Create your first job posting to start receiving applications, or adjust your filters to see more results."
            actionText="Post a Job"
            actionHref="/dashboard/company/jobs/create"
            className="p-16 text-center flex flex-col items-center"
          />
        )}

        {/* Pagination controls */}
        {meta && initialJobs.length > 0 && (
          <div className="px-5 py-4 border-t border-border/40 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing page{" "}
              <span className="font-medium text-foreground">{meta.page}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {meta.lastPage}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1 || isPending}
                onClick={() => updateFilters({ page: meta.page - 1 })}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.lastPage || isPending}
                onClick={() => updateFilters({ page: meta.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};
