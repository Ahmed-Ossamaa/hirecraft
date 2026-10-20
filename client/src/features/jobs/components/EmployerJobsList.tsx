"use client";

import React, { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { useGetCompanyJobs } from "@/shared/api/generated/jobs/jobs";
import { Button } from "@/shared/components/ui";
import {
  MdAdd,
  MdWorkOutline,
  MdSearch,
  MdClose,
  MdArrowUpward,
  MdArrowDownward,
  MdUnfoldMore,
} from "react-icons/md";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { JobDetailsModal } from "./JobDetailsModal";
import { EmployerJobTableRow } from "./EmployerJobTableRow";
import { EmptyState, Tabs, TableSkeleton } from "@/shared/components/ui";

export const EmployerJobsList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "ALL";
  const currentSearch = searchParams.get("search") || "";
  const currentSortBy = searchParams.get("sortBy") || "date";
  const currentSortOrder = searchParams.get("order") || "DESC";

  const currentPage = Number(searchParams.get("page")) || 1;

  const { data: jobsRes, isLoading } = useGetCompanyJobs({
    page: currentPage,
    limit: 10,
    status: currentStatus !== "ALL" ? (currentStatus as any) : undefined,
    search: currentSearch || undefined,
    sortBy: currentSortBy || undefined,
    order: currentSortOrder as any || undefined,
  });

  const jobs = (jobsRes?.data?.data || []) as JobWithStatsDto[];
  const meta = {
    total: jobsRes?.data?.total || 0,
    page: jobsRes?.data?.page || 1,
    lastPage: jobsRes?.data?.totalPages || 1,
  };

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [selectedJob, setSelectedJob] = useState<JobWithStatsDto | null>(null);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const debouncedUpdateSearch = useDebouncedCallback((val: string) => {
    updateFilters({ search: val, page: 1 });
  }, 400);

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

    router.push(`?${params.toString()}`, { scroll: false });
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
      return (
        <MdUnfoldMore className="inline-block ml-1 text-sm text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      );
    }
    return currentSortOrder === "ASC" ? (
      <MdArrowUpward className="inline-block ml-1 text-sm text-primary" />
    ) : (
      <MdArrowDownward className="inline-block ml-1 text-sm text-primary" />
    );
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
              onChange={(e) => {
                setSearchValue(e.target.value);
                debouncedUpdateSearch(e.target.value);
              }}
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  debouncedUpdateSearch.cancel();
                  updateFilters({ search: "", page: 1 });
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <MdClose />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : jobs.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/40 p-10 shadow-sm">
          <EmptyState
            icon={<MdWorkOutline className="text-3xl" />}
            title={
              currentSearch
                ? "No matching jobs found"
                : "No jobs found"
            }
            description={
              currentSearch
                ? `No jobs match "${currentSearch}". Try adjusting your search or filters.`
                : currentStatus === "ALL"
                  ? "You haven't posted any jobs yet."
                  : `You don't have any ${currentStatus.toLowerCase()} jobs.`
            }
            actionText={
              currentStatus === "ALL" && !currentSearch
                ? "Post your first job"
                : "Clear filters"
            }
            onAction={
              currentStatus === "ALL" && !currentSearch
                ? () => router.push("/dashboard/company/jobs/create")
                : () => {
                    setSearchValue("");
                    debouncedUpdateSearch.cancel();
                    updateFilters({ search: "", status: "ALL" });
                  }
            }
          />
        </div>
      ) : (
        <div className={`bg-card rounded-xl border border-border/40 shadow-sm transition-opacity opacity-100`}>
          <div className="overflow-x-auto pb-24">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Job Title
                </th>
                <th
                  className="px-5 py-3 font-medium cursor-pointer group hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  <span className="inline-flex items-center">
                    Status <SortIcon field="status" />
                  </span>
                </th>
                <th className="px-5 py-3 font-medium">
                  Type & Experience
                </th>
                <th
                  className="px-5 py-3 font-medium text-center cursor-pointer group hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('applicants')}
                >
                  <span className="inline-flex items-center justify-center">
                    Applicants <SortIcon field="applicants" />
                  </span>
                </th>
                <th
                  className="px-5 py-3 font-medium cursor-pointer group hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('date')}
                >
                  <span className="inline-flex items-center">
                    Posted <SortIcon field="date" />
                  </span>
                </th>
                <th className="px-5 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {jobs.map((job) => (
                <EmployerJobTableRow
                  key={job.id}
                  job={job}
                  onSelect={setSelectedJob}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {meta && jobs.length > 0 && (
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
                disabled={meta.page <= 1}
                onClick={() => updateFilters({ page: meta.page - 1 })}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.lastPage}
                onClick={() => updateFilters({ page: meta.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      )}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};
