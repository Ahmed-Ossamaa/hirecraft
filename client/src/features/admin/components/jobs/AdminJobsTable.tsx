"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useGetAdminJobs } from "@/shared/api/generated/admin-jobs/admin-jobs";
import type { Job, JobStatus } from "@/shared/api/generated/model";
import { TableSkeleton } from "@/shared/components/ui/TableSkeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Input } from "@/shared/components/ui/Input";
import { Tabs } from "@/shared/components/ui/Tabs";
import { JobStatusBadge } from "@/shared/components/ui/JobStatusBadge";
import { useConfirm } from "@/shared/providers/confirm-provider";
import { useAdminMutations } from "../../hooks/useAdminMutations";
import { AdminJobActionMenu } from "./AdminJobActionMenu";
import {
  MdSearch,
  MdOpenInNew,
  MdWorkOutline,
  MdClose,
  MdFilterList,
  MdArrowUpward,
  MdArrowDownward,
  MdUnfoldMore,
} from "react-icons/md";

type SortField = "publishedAt" | "companyId" | "date";
type SortDirection = "asc" | "desc";

export function AdminJobsTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyId = searchParams.get("companyId") || undefined;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [statusTab, setStatusTab] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortField>("publishedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return (
        <MdUnfoldMore className="inline-block ml-1 text-sm text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      );
    }
    return sortDirection === "asc" ? (
      <MdArrowUpward className="inline-block ml-1 text-xs text-primary" />
    ) : (
      <MdArrowDownward className="inline-block ml-1 text-xs text-primary" />
    );
  };

  const { confirm } = useConfirm();
  const { updateJobStatus, isUpdatingJobStatus, deleteJob, isDeletingJob } =
    useAdminMutations();

  const statusParam =
    statusTab !== "ALL" ? (statusTab as JobStatus) : undefined;

  const { data, isLoading, isError } = useGetAdminJobs(
    {
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      status: statusParam,
      companyId,
      sortBy,
      order: sortDirection === "asc" ? "ASC" : "DESC",
    },
    {
      query: {
        staleTime: 30 * 1000,
      },
    }
  );

  const jobs = (data?.data?.data as Job[]) || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleStatusChange = async (job: Job, newStatus: JobStatus) => {
    if (job.status === newStatus) return;
    await updateJobStatus(job.id, {
      status: newStatus as any,
    });
  };

  const handleDeleteJob = async (job: Job) => {
    const confirmed = await confirm({
      title: "Permanently Delete Job",
      message: `Are you sure you want to permanently delete "${job.title}"? This action is irreversible and will completely delete the job and its application records.`,
      variant: "danger",
      confirmText: "Delete Permanently",
    });

    if (confirmed) {
      await deleteJob(job.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Status Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Tabs
            tabs={[
              { id: "ALL", label: "All Jobs" },
              { id: "PUBLISHED", label: "Published" },
              { id: "DRAFT", label: "Draft" },
              { id: "CLOSED", label: "Closed" },
            ]}
            activeTab={statusTab}
            onTabChange={(id) => {
              setStatusTab(id);
              setPage(1);
            }}
          />

          <div className="relative w-full md:w-72">
            <Input
              placeholder="Search by job title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none" />
          </div>
        </div>

        {/* Company Filter Active Badge */}
        {companyId && (
          <div className="flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground">
            <MdFilterList className="text-primary text-base shrink-0" />
            <span>
              Filtering jobs for Company ID:{" "}
              <strong className="font-mono bg-background/80 px-1.5 py-0.5 rounded border border-border">
                {companyId}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("companyId");
                const newQuery = params.toString();
                router.replace(
                  newQuery
                    ? `/dashboard/admin/jobs?${newQuery}`
                    : `/dashboard/admin/jobs`
                );
              }}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-[11px] font-medium transition-colors shadow-sm"
              title="Clear company filter"
            >
              <MdClose className="text-xs" />
              Clear company filter
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          Failed to load jobs list. Please refresh or try again.
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<MdWorkOutline className="text-3xl text-muted-foreground" />}
          title="No jobs found"
          description="Try adjusting your search criteria or switching status tabs."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Job Title</th>
                  <th
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-foreground group"
                    onClick={() => toggleSort("companyId")}
                  >
                    <div className="flex items-center">
                      Company
                      <SortIcon field="companyId" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-foreground group"
                    onClick={() => toggleSort("publishedAt")}
                  >
                    <div className="flex items-center">
                      Publish Date
                      <SortIcon field="publishedAt" />
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <MdWorkOutline className="text-base" />
                        </div>
                        <div>
                          <Link
                            href={`/jobs?jobId=${job.id}`}
                            target="_blank"
                            className="font-semibold text-foreground hover:text-primary transition-colors max-w-[200px] sm:max-w-xs truncate inline-flex items-center gap-1 group"
                            title="Open Public Job Listing"
                          >
                            <span className="truncate">{job.title}</span>
                            <MdOpenInNew className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </Link>
                          <div className="text-muted-foreground text-[10px]">
                            {job.jobType || "Full-time"} •{" "}
                            {job.experienceLevel || "All levels"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-foreground font-medium">
                      {job.companyName || "Employer"}
                    </td>

                    <td className="px-5 py-3.5 text-muted-foreground text-[11px]">
                      {[job.city, job.country].filter(Boolean).join(", ") ||
                        "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <JobStatusBadge status={job.status} />
                    </td>

                    <td 
                      className="px-5 py-3.5 text-muted-foreground text-[11px]"
                      title={`Created: ${new Date(job.createdAt).toLocaleString()}`}
                    >
                      {job.publishedAt ? new Date(job.publishedAt).toLocaleString() : "-"}
                    </td>

                    {/* Actions Menu */}
                    <td className="px-5 py-3.5 text-right">
                      <AdminJobActionMenu
                        job={job}
                        onStatusChange={handleStatusChange}
                        onDeleteJob={handleDeleteJob}
                        disabled={isUpdatingJobStatus || isDeletingJob}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing {jobs.length} of {total} jobs
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

