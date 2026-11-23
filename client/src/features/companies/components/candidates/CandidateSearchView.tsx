"use client";

import { type SubmitEvent, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { MdPerson, MdPersonSearch, MdRefresh, MdSearch } from "react-icons/md";
import type {
  Machine,
  MachineCategory,
  SearchByMachineIdParams,
  SearchByMachineIdExperienceLevel,
  WorkerProfileSearchResultDto,
} from "@/shared/api/generated/model";
import { useGetMatchingCriteria } from "@/shared/api/generated/jobs/jobs";
import { CandidateCard } from "./CandidateCard";
import { useGetMachineCategories } from "@/shared/api/generated/machine-categories/machine-categories";
import { useGetMachines } from "@/shared/api/generated/machines/machines";
import { useSearchByMachineId } from "@/shared/api/generated/worker-profiles/worker-profiles";
import { CountryCitySelect } from "@/shared/components/ui/CountryCitySelect";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Select } from "@/shared/components/ui/Select";
import { WorkerProfileSlideOver } from "@/features/worker-profiles/components/WorkerProfileSlideOver";
import { getApiError } from "@/shared/utils/error";

const PAGE_SIZE = 10;

const EXPERIENCE_LEVEL_OPTIONS: {
  label: string;
  value: SearchByMachineIdExperienceLevel;
}[] = [
  { value: "ENTRY_LEVEL", label: "Entry level" },
  { value: "SKILLED", label: "Skilled" },
  { value: "SENIOR", label: "Senior" },
  { value: "EXPERT", label: "Expert" },
];

type SearchFilters = Omit<SearchByMachineIdParams, "page" | "limit">;

interface CandidateSearchViewProps {
  jobId?: string;
}

export function CandidateSearchView({ jobId }: CandidateSearchViewProps) {
  const [machineCategoryId, setMachineCategoryId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<
    SearchByMachineIdExperienceLevel | ""
  >("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(
    null,
  );
  const [appliedJobId, setAppliedJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );
  const initializedJobId = useRef<string | null>(null);

  const {
    data: matchingCriteriaResponse,
    isLoading: isLoadingMatchingCriteria,
    isFetching: isFetchingMatchingCriteria,
    isError: isMatchingCriteriaError,
    error: matchingCriteriaError,
    refetch: refetchMatchingCriteria,
  } = useGetMatchingCriteria(jobId ?? "", {
    query: { enabled: Boolean(jobId) },
  });
  const matchingCriteria = matchingCriteriaResponse?.data;

  useEffect(() => {
    if (!jobId) {
      initializedJobId.current = null;
      setAppliedJobId(null);
      return;
    }

    if (
      isFetchingMatchingCriteria ||
      !matchingCriteria ||
      initializedJobId.current === jobId
    ) {
      return;
    }

    setMachineCategoryId(matchingCriteria.machineCategoryId);
    setMachineId(matchingCriteria.machineId);
    setExperienceLevel(matchingCriteria.experienceLevel);
    setCountry(matchingCriteria.country);
    setCity(matchingCriteria.city);
    setPage(1);
    setAppliedFilters({
      machineCategoryId: matchingCriteria.machineCategoryId,
      machineId: matchingCriteria.machineId,
      experienceLevel: matchingCriteria.experienceLevel,
      country: matchingCriteria.country,
      city: matchingCriteria.city,
    });
    initializedJobId.current = jobId;
    setAppliedJobId(jobId);
  }, [jobId, matchingCriteria, isFetchingMatchingCriteria]);

  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetMachineCategories({ limit: 100 });
  const {
    data: machinesResponse,
    isLoading: isLoadingMachines,
    isError: isMachinesError,
    refetch: refetchMachines,
  } = useGetMachines({ limit: 100 });

  const categories =
    (categoriesResponse?.data?.data as MachineCategory[] | undefined) ?? [];
  const machines =
    (machinesResponse?.data?.data as Machine[] | undefined) ?? [];
  const filteredMachines = machineCategoryId
    ? machines.filter((machine) => machine.categoryId === machineCategoryId)
    : machines;

  const canSearchAppliedFilters =
    appliedFilters !== null && (!jobId || appliedJobId === jobId);
  const isApplyingJobCriteria =
    Boolean(jobId) &&
    !isMatchingCriteriaError &&
    (isLoadingMatchingCriteria ||
      isFetchingMatchingCriteria ||
      (matchingCriteria !== undefined && appliedJobId !== jobId));
  const queryParams: SearchByMachineIdParams | undefined =
    canSearchAppliedFilters
      ? { ...appliedFilters, page, limit: PAGE_SIZE }
      : undefined;
  const {
    data: searchResponse,
    isFetching: isSearching,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchByMachineId(queryParams, {
    query: { enabled: canSearchAppliedFilters },
  });

  const searchPage = searchResponse?.data;
  const candidates =
    (searchPage?.data as WorkerProfileSearchResultDto[] | undefined) ?? [];
  const currentPage = searchPage?.page ?? page;
  const totalPages = currentPage + (searchPage?.hasNext ? 1 : 0);
  const accessDenied =
    isAxiosError(searchError) && searchError.response?.status === 403;
  const matchingCriteriaAccessDenied =
    isAxiosError(matchingCriteriaError) &&
    matchingCriteriaError.response?.status === 403;

  const handleSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!machineCategoryId && !machineId) return;

    const filters: SearchFilters = {};
    if (machineCategoryId) filters.machineCategoryId = machineCategoryId;
    if (machineId) filters.machineId = machineId;
    if (experienceLevel) filters.experienceLevel = experienceLevel;
    if (country) filters.country = country;
    if (city) filters.city = city;

    setPage(1);
    setAppliedJobId(jobId ?? null);
    setAppliedFilters(filters);
  };

  const handleCountryChange = (nextCountry: string) => {
    setCountry(nextCountry);
    setCity("");
  };

  const clearFilters = () => {
    setMachineCategoryId("");
    setMachineId("");
    setExperienceLevel("");
    setCountry("");
    setCity("");
    setAppliedFilters(null);
    setPage(1);
  };

  return (
    <div className="mx-auto mb-5 flex w-full max-w-5xl flex-1 flex-col space-y-6 py-2">
      <header className="flex items-center gap-3 pb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <MdPersonSearch className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold tracking-tight text-foreground">
            Find Candidates
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Discover workers by machine experience and location.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSearch}
        className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Machine category"
            value={machineCategoryId}
            disabled={isLoadingCategories || isApplyingJobCriteria}
            onChange={(event) => {
              setMachineCategoryId(event.target.value);
              setMachineId("");
            }}
            options={[
              { label: "All categories", value: "" },
              ...categories.map((category) => ({
                label: category.nameEn,
                value: category.id,
              })),
            ]}
          />
          <Select
            label="Machine"
            value={machineId}
            disabled={isLoadingMachines || isApplyingJobCriteria}
            onChange={(event) => setMachineId(event.target.value)}
            options={[
              {
                label: machineCategoryId
                  ? "Any machine in this category"
                  : "Select a machine",
                value: "",
              },
              ...filteredMachines.map((machine) => ({
                label: machine.nameEn,
                value: machine.id,
              })),
            ]}
          />
          <Select
            label="Minimum experience"
            value={experienceLevel}
            disabled={isApplyingJobCriteria}
            onChange={(event) =>
              setExperienceLevel(
                event.target.value as SearchByMachineIdExperienceLevel | "",
              )
            }
            options={[
              { label: "Any experience level", value: "" },
              ...EXPERIENCE_LEVEL_OPTIONS,
            ]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CountryCitySelect
              countryLabel="Country"
              cityLabel="City"
              country={country}
              city={city}
              onCountryChange={handleCountryChange}
              onCityChange={setCity}
              disabled={isApplyingJobCriteria}
            />
          </div>
        </div>

        {(isCategoriesError || isMachinesError) && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <span>Failed to load machine filters.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isCategoriesError) void refetchCategories();
                if (isMachinesError) void refetchMachines();
              }}
            >
              Try again
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Select a machine category or a machine to start searching.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={clearFilters}
              disabled={
                isApplyingJobCriteria ||
                (!machineCategoryId &&
                  !machineId &&
                  !experienceLevel &&
                  !country &&
                  !city &&
                  !appliedFilters)
              }
            >
              Clear
            </Button>
            <Button
              type="submit"
              leftIcon={<MdSearch />}
              disabled={
                isSearching ||
                isApplyingJobCriteria ||
                (!machineCategoryId && !machineId) ||
                isLoadingCategories ||
                isLoadingMachines
              }
            >
              {isSearching ? "Searching..." : "Search candidates"}
            </Button>
          </div>
        </div>
      </form>

      {jobId && isLoadingMatchingCriteria ? (
        <div
          className="space-y-3"
          aria-label="Loading job matching criteria"
          aria-busy
        >
          <div className="h-20 animate-pulse rounded-xl border border-border/60 bg-card" />
          <div className="h-36 animate-pulse rounded-xl border border-border/60 bg-card" />
        </div>
      ) : jobId && isMatchingCriteriaError && !canSearchAppliedFilters ? (
        matchingCriteriaAccessDenied ? (
          <EmptyState
            icon={<MdPerson className="text-3xl" />}
            title="Job matching requires a Pro or Enterprise plan"
            description={getApiError(
              matchingCriteriaError,
              "Your company's plan does not include job matching.",
            )}
            actionText="View plans"
            actionHref="/dashboard/company/billing"
          />
        ) : (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-sm"
          >
            <p className="mb-3 font-medium text-destructive">
              {getApiError(
                matchingCriteriaError,
                "Failed to load job matching criteria.",
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              leftIcon={<MdRefresh />}
              onClick={() => void refetchMatchingCriteria()}
            >
              Try again
            </Button>
          </div>
        )
      ) : jobId && matchingCriteria && appliedJobId !== jobId ? (
        <div
          className="space-y-3"
          aria-label="Applying job matching criteria"
          aria-busy
        >
          <div className="h-20 animate-pulse rounded-xl border border-border/60 bg-card" />
          <div className="h-36 animate-pulse rounded-xl border border-border/60 bg-card" />
        </div>
      ) : appliedFilters === null ? (
        <EmptyState
          icon={<MdPersonSearch className="text-3xl" />}
          title="Search for candidates"
          description="Choose a machine category or machine, add optional filters, and search to see matching worker profiles."
          className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm md:p-14"
        />
      ) : isSearching ? (
        <div className="space-y-3" aria-label="Loading candidates" aria-busy>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4"
            >
              <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 max-w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isSearchError ? (
        accessDenied ? (
          <EmptyState
            icon={<MdPerson className="text-3xl" />}
            title="Candidate search requires a Pro or Enterprise plan"
            description={getApiError(
              searchError,
              "Your company's plan does not include candidate search.",
            )}
            actionText="View plans"
            actionHref="/dashboard/company/billing"
          />
        ) : (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-sm"
          >
            <p className="mb-3 font-medium text-destructive">
              {getApiError(searchError, "Failed to search candidates.")}
            </p>
            <Button
              type="button"
              variant="outline"
              leftIcon={<MdRefresh />}
              onClick={() => void refetchSearch()}
            >
              Try again
            </Button>
          </div>
        )
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={<MdPerson className="text-3xl" />}
          title="No matching candidates found"
          description="Try broadening your criteria or choosing a different machine or location."
          actionText="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onSelect={setSelectedCandidateId}
              />
            ))}
          </div>
          {(currentPage > 1 || searchPage?.hasNext) && (
            <div className="flex justify-center pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <WorkerProfileSlideOver
        isOpen={selectedCandidateId !== null}
        onClose={() => setSelectedCandidateId(null)}
        workerProfileId={selectedCandidateId}
      />
    </div>
  );
}
