"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EmployerApplicationResponseDto,
  GetApplicationsForJobTab,
} from "@/shared/api/generated/model";
import {
  useGetApplicationsForJob,
  useGetJobApplicationStats,
} from "@/shared/api/generated/job-applications/job-applications";
import { useGetJobById } from "@/shared/api/generated/jobs/jobs";
import {
  useUpdateApplicationStatus,
  useUpdateApplicationStar,
  useUpdateApplicationArchive,
} from "@/features/jobs/api/useApplicationMutations";
import {
  MdPeople,
  MdSearch,
  MdClose,
  MdPersonOutline,
  MdArrowUpward,
  MdArrowDownward,
  MdStar,
} from "react-icons/md";
import {
  Tabs,
  TableSkeleton,
  EmptyState,
  Pagination,
} from "@/shared/components/ui";
import { useDebouncedCallback } from "use-debounce";
import { WorkerProfileSlideOver } from "./WorkerProfileSlideOver";
import { ApplicantMetricsCards } from "./ApplicantMetricsCards";
import { ApplicantTableRow } from "./ApplicantTableRow";
import { CoverLetterModal } from "./CoverLetterModal";

interface JobApplicantsViewProps {
  jobId: string;
}

export const JobApplicantsView: React.FC<JobApplicantsViewProps> = ({
  jobId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State
  const currentTab =
    (searchParams.get("tab") as GetApplicationsForJobTab) || "ALL";
  const currentSearch = searchParams.get("search") || "";
  const currentOrder = (searchParams.get("order") as "ASC" | "DESC") || "DESC";
  const currentPage = Number(searchParams.get("page")) || 1;

  // Local state
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [selectedApplication, setSelectedApplication] =
    useState<EmployerApplicationResponseDto | null>(null);
  const [viewingCoverLetterApp, setViewingCoverLetterApp] =
    useState<EmployerApplicationResponseDto | null>(null);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const debouncedUpdateSearch = useDebouncedCallback((val: string) => {
    updateFilters({ search: val, page: 1 });
  }, 400);

  // Queries
  const {
    data: jobData,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useGetJobById(jobId, {
    query: {
      staleTime: 1000 * 60 * 5,
    },
  });
  const job = jobData?.data;

  const { data: statsData, isLoading: isStatsLoading } =
    useGetJobApplicationStats(jobId);

  const {
    data: applicationsData,
    isLoading: isAppsLoading,
    isError,
    refetch,
  } = useGetApplicationsForJob(jobId, {
    tab: currentTab,
    search: currentSearch || undefined,
    order: currentOrder,
    page: currentPage,
    limit: 10,
  });

  //Mutation Hooks
  const updateStatusMutation = useUpdateApplicationStatus(jobId);
  const updateStarMutation = useUpdateApplicationStar(jobId);
  const updateArchiveMutation = useUpdateApplicationArchive(jobId, currentTab);

  const applications = (applicationsData?.data?.data ||
    []) as EmployerApplicationResponseDto[];
  const totalPages = applicationsData?.data?.totalPages || 1;
  const stats = statsData?.data;

  const updateFilters = (updates: {
    tab?: GetApplicationsForJobTab;
    search?: string;
    order?: "ASC" | "DESC";
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.tab !== undefined) {
      if (updates.tab === "ALL") {
        params.delete("tab");
      } else {
        params.set("tab", updates.tab);
      }
      params.delete("page");
    }

    if (updates.search !== undefined) {
      if (updates.search) {
        params.set("search", updates.search);
      } else {
        params.delete("search");
      }
      params.delete("page");
    }

    if (updates.order !== undefined) {
      if (updates.order === "DESC") {
        params.delete("order");
      } else {
        params.set("order", updates.order);
      }
    }

    if (updates.page !== undefined) {
      if (updates.page > 1) {
        params.set("page", updates.page.toString());
      } else {
        params.delete("page");
      }
    }

    const queryStr = params.toString();
    router.push(queryStr ? `?${queryStr}` : window.location.pathname, {
      scroll: false,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    debouncedUpdateSearch(val);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    debouncedUpdateSearch.cancel();
    updateFilters({ search: "", page: 1 });
  };

  const handleToggleSort = () => {
    const newOrder = currentOrder === "DESC" ? "ASC" : "DESC";
    updateFilters({ order: newOrder, page: 1 });
  };

  const filterTabs = [
    { id: "ALL", label: "All" },
    { id: "PENDING", label: "Pending" },
    { id: "SHORTLISTED", label: "Shortlisted" },
    { id: "SCHEDULED", label: "Scheduled" },
    { id: "OFFERED", label: "Offered" },
    { id: "CLOSED", label: "Closed" },
    {
      id: "STARRED",
      label: (
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          Starred <MdStar className="text-amber-400 text-sm shrink-0" />
        </span>
      ),
    },
    { id: "ARCHIVED", label: "Archived" },
  ];
  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdPeople className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight line-clamp-1">
            {isJobLoading ? (
              <span className="inline-block w-48 h-7 bg-muted/60 animate-pulse rounded align-middle" />
            ) : isJobError || !job ? (
              "Applicants"
            ) : (
              `Applicants: ${job.title}`
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and manage candidates who applied for this role.
          </p>
        </div>
      </div>

      {isJobError ? (
        <div className="bg-card rounded-xl border border-destructive/20 p-8 text-center shadow-sm">
          <p className="text-destructive font-semibold mb-1">
            Job not found or access denied
          </p>
          <p className="text-sm text-muted-foreground">
            Please check the URL or confirm you have permission to manage this
            job.
          </p>
        </div>
      ) : (
        <>
          {/* Analytics Cards */}
          <ApplicantMetricsCards stats={stats} isLoading={isStatsLoading} />

          {/* Filter Tabs & Search */}
          <div className="space-y-4">
            <Tabs
              tabs={filterTabs}
              activeTab={currentTab}
              onTabChange={(id) =>
                updateFilters({ tab: id as GetApplicationsForJobTab })
              }
            />

            {/* Search Bar */}
            <div className="flex items-center gap-3 w-full bg-card p-1.5 rounded-xl border border-border/40 shadow-sm focus-within:border-primary/50 transition-colors">
              <div className="flex items-center flex-1 gap-2 px-3">
                <MdSearch className="text-muted-foreground text-xl shrink-0" />
                <input
                  type="text"
                  placeholder="Search candidate name..."
                  className="bg-transparent border-none outline-none text-sm w-full py-1.5 text-foreground placeholder:text-muted-foreground"
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                    aria-label="Clear search"
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Applicants Table */}
          {isAppsLoading ? (
            <TableSkeleton rows={5} />
          ) : isError ? (
            <div className="bg-card rounded-xl border border-border/40 p-10 text-center shadow-sm">
              <p className="text-red-500 font-medium mb-3">
                Failed to load applicants.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-card rounded-xl border border-border/40 p-10 shadow-sm">
              <EmptyState
                icon={<MdPersonOutline className="text-3xl" />}
                title={
                  currentSearch
                    ? `No candidates found matching "${currentSearch}"`
                    : currentTab === "STARRED"
                      ? "No starred candidates yet"
                      : currentTab === "ARCHIVED"
                        ? "No archived applications"
                        : "No applicants yet"
                }
                description={
                  currentSearch
                    ? "Try searching with a different candidate name."
                    : currentTab === "STARRED"
                      ? "Star important candidates to track them across all stages."
                      : currentTab === "ARCHIVED"
                        ? "Archived candidates will appear here."
                        : "Candidates who apply for this job will appear here."
                }
                actionText={
                  currentSearch || currentTab !== "ALL"
                    ? "Clear filters"
                    : undefined
                }
                onAction={
                  currentSearch || currentTab !== "ALL"
                    ? () => {
                        setSearchValue("");
                        debouncedUpdateSearch.cancel();
                        updateFilters({ search: "", tab: "ALL", page: 1 });
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-muted/30 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 font-medium">Applicant</th>
                      <th className="px-5 py-3 font-medium">Cover Letter</th>
                      <th
                        className="px-5 py-3 font-medium cursor-pointer group hover:text-foreground transition-colors select-none"
                        onClick={handleToggleSort}
                      >
                        <span className="inline-flex items-center">
                          Applied At
                          {currentOrder === "ASC" ? (
                            <MdArrowUpward className="inline-block ml-1 text-sm text-primary" />
                          ) : (
                            <MdArrowDownward className="inline-block ml-1 text-sm text-primary" />
                          )}
                        </span>
                      </th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right pr-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {applications.map((app) => (
                      <ApplicantTableRow
                        key={app.id}
                        application={app}
                        onSelectApplicant={(selected) => setSelectedApplication(selected)}
                        onViewCoverLetter={(selected) => setViewingCoverLetterApp(selected)}
                        onToggleStar={(id, isStarred) =>
                          updateStarMutation.mutate({
                            id,
                            data: { isStarred },
                          })
                        }
                        onStatusChange={(id, newStatus) =>
                          updateStatusMutation.mutate({
                            id,
                            data: { status: newStatus },
                          })
                        }
                        onToggleArchive={(id, isArchived) =>
                          updateArchiveMutation.mutate({
                            id,
                            data: { isArchived },
                          })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages >= 1 && (
            <div className="flex justify-center items-center pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => updateFilters({ page })}
              />
            </div>
          )}
        </>
      )}

      {/* Cover Letter Modal */}
      <CoverLetterModal
        isOpen={!!viewingCoverLetterApp}
        onClose={() => setViewingCoverLetterApp(null)}
        application={viewingCoverLetterApp}
        onViewProfile={() => {
          if (viewingCoverLetterApp) {
            setSelectedApplication(viewingCoverLetterApp);
          }
        }}
      />

      {/* worker Profile SlideOver */}
      <WorkerProfileSlideOver
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        workerProfileId={selectedApplication?.workerProfileId ?? null}
        coverLetter={selectedApplication?.coverLetter}
      />
    </div>
  );
};
