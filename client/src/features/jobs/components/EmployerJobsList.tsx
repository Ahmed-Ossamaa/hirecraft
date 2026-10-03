"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui";
import {
  MdAdd,
  MdWorkOutline,
  MdMoreVert,
  MdSearch,
  MdPeopleOutline,
  MdClose,
} from "react-icons/md";
import Link from "next/link";
import { formatTimeAgo } from "@/shared/lib/formatTimeAgo";
import { useRouter, useSearchParams } from "next/navigation";
import { useUpdateJob } from "@/shared/api/generated/jobs/jobs";
import { useMutation } from "@tanstack/react-query";
import { customAxiosInstance } from "@/shared/api/axios-instance";
import { toast } from "sonner";
import { JobDetailsModal } from "./JobDetailsModal";
import { useConfirm } from "@/shared/providers/confirm-provider";

interface EmployerJobsListProps {
  initialJobs: JobWithStatsDto[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

function ActionMenu({ job }: { job: JobWithStatsDto }) {

  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { confirm } = useConfirm();

  const updateMutation = useUpdateJob();
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      customAxiosInstance({
        url: `/api/v1/jobs/${id}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Job deleted successfully");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to delete job");
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > 280) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
    setOpen(!open);
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateMutation.mutateAsync({
        id: job.id,
        data: { status: status as any },
      });
      toast.success(`Job marked as ${status}`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete Job",
      message: "Are you sure you want to delete this job? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (isConfirmed) {
      deleteMutation.mutate(job.id);
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        onClick={handleToggle}
      >
        <MdMoreVert className="text-xl" />
      </Button>
      {open && (
        <div
          className={`absolute right-0 z-50 w-48 rounded-lg bg-card shadow-lg ring-1 ring-slate-300 dark:ring-slate-700  border border-border/60 focus:outline-none py-1 overflow-hidden ${openUpwards ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          <Link
            href={`/dashboard/company/jobs/${job.id}/edit`}
            className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover transition-colors"
          >
            Edit Job
          </Link>
          <Link
            href={`/jobs?jobId=${job.id}`}
            className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover transition-colors"
          >
            View Public Job
          </Link>
          <div className="border-t border-border/40 my-1"></div>
          <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Change Status
          </div>
          {job.status !== "PUBLISHED" && (
            <button
              onClick={() => handleStatusChange("PUBLISHED")}
              disabled={updateMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {job.status !== "CLOSED" && (
            <button
              onClick={() => handleStatusChange("CLOSED")}
              disabled={updateMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-card-hover transition-colors disabled:opacity-50"
            >
              Close
            </button>
          )}
          {job.status !== "DRAFT" && (
            <button
              onClick={() => handleStatusChange("DRAFT")}
              disabled={updateMutation.isPending}
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-card-hover transition-colors disabled:opacity-50"
            >
              Move to Draft
            </button>
          )}
          <div className="border-t border-border/40 my-1"></div>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            Delete Job
          </button>
        </div>
      )}
    </div>
  );
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
          <div className="flex gap-4 border-b border-border/40 w-full mb-2 h-10">
            {["ALL", "PUBLISHED", "DRAFT", "CLOSED"].map((tab) => (
              <button
                key={tab}
                onClick={() => updateFilters({ status: tab })}
                className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                  currentStatus === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "ALL"
                  ? "All Jobs"
                  : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
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
                      <ActionMenu job={job} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {initialJobs.length === 0 && (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mb-4">
              <MdWorkOutline className="text-3xl" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              No jobs found
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Create your first job posting to start receiving applications, or
              adjust your filters to see more results.
            </p>
            <Link href="/dashboard/jobs/create">
              <Button>Post a Job</Button>
            </Link>
          </div>
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
