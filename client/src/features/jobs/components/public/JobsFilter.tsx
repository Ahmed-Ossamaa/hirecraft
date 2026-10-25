"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  Input,
  Select,
  CountryCitySelect,
  Button,
} from "@/shared/components/ui";
import {
  FindAllExperienceLevel,
  FindAllJobType,
} from "@/shared/api/generated/model";
import { FiSearch, FiX } from "react-icons/fi";

export const JobsFilter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [expLevel, setExpLevel] = useState(
    searchParams.get("experienceLevel") || "",
  );
  const [yearsOfExp, setYearsOfExp] = useState(
    searchParams.get("yearsOfExperience") || "",
  );
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "");

  // Debounced URL search updater
  const debouncedUpdateSearch = useDebouncedCallback((val: string) => {
    updateQueryParams({ search: val });
  }, 500);

  const updateQueryParams = useCallback(
    (paramsToUpdate: Record<string, string | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (!value) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });

      // reset page to 1 when filters change
      current.delete("page");

      const search = current.toString();
      const query = search ? `?${search}` : "";

      startTransition(() => {
        router.push(`${pathname}${query}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    setSearch(currentSearch);
    debouncedUpdateSearch.cancel();

    setCountry(searchParams.get("country") || "");
    setCity(searchParams.get("city") || "");
    setExpLevel(searchParams.get("experienceLevel") || "");
    setYearsOfExp(searchParams.get("yearsOfExperience") || "");
    setJobType(searchParams.get("jobType") || "");
  }, [searchParams, debouncedUpdateSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    debouncedUpdateSearch(val);
  };

  const handleClearSearch = () => {
    setSearch("");
    updateQueryParams({ search: undefined });
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setCity("");
    updateQueryParams({ country: val, city: undefined });
  };

  const handleCityChange = (val: string) => {
    setCity(val);
    updateQueryParams({ city: val });
  };

  const handleExpLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setExpLevel(val);
    updateQueryParams({ experienceLevel: val });
  };

  const handleYearsOfExpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setYearsOfExp(val);
    updateQueryParams({ yearsOfExperience: val });
  };

  const handleJobTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setJobType(val);
    updateQueryParams({ jobType: val });
  };

  const handleClearFilters = () => {
    setSearch("");
    setCountry("");
    setCity("");
    setExpLevel("");
    setYearsOfExp("");
    setJobType("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    search || country || city || expLevel || yearsOfExp || jobType,
  );

  const expLevelOptions = [
    { label: "All Experience Levels", value: "" },
    { label: "Entry Level", value: FindAllExperienceLevel.ENTRY_LEVEL },
    { label: "Skilled", value: FindAllExperienceLevel.SKILLED },
    { label: "Senior", value: FindAllExperienceLevel.SENIOR },
    { label: "Expert", value: FindAllExperienceLevel.EXPERT },
  ];

  const yearsOfExpOptions = [
    { label: "All Experience Years", value: "" },
    { label: "1+ Years Exp", value: "1" },
    { label: "2+ Years Exp", value: "2" },
    { label: "3+ Years Exp", value: "3" },
    { label: "5+ Years Exp", value: "5" },
    { label: "8+ Years Exp", value: "8" },
    { label: "10+ Years Exp", value: "10" },
  ];

  const jobTypeOptions = [
    { label: "All Job Types", value: "" },
    { label: "Full Time", value: FindAllJobType.FULL_TIME },
    { label: "Part Time", value: FindAllJobType.PART_TIME },
    { label: "Contract", value: FindAllJobType.CONTRACT },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-2xl mb-6">
      {/* Top row: Search input */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none" />
        <Input
          placeholder="Search jobs, machines..."
          value={search}
          onChange={handleSearchChange}
          className="pl-9"
        />
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm cursor-pointer p-1"
            aria-label="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Second row: Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Country & City */}
        <CountryCitySelect
          country={country}
          city={city}
          onCountryChange={handleCountryChange}
          onCityChange={handleCityChange}
          allCountriesOptionLabel="All Countries"
          allCitiesOptionLabel="All Cities"
        />

        {/* Experience Level */}
        <Select
          value={expLevel}
          options={expLevelOptions}
          onChange={handleExpLevelChange}
        />

        {/* Years of Experience */}
        <Select
          value={yearsOfExp}
          options={yearsOfExpOptions}
          onChange={handleYearsOfExpChange}
        />

        {/* Job Type */}
        <Select
          value={jobType}
          options={jobTypeOptions}
          onChange={handleJobTypeChange}
        />
      </div>

      {/* Clear filters btn */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            leftIcon={<FiX className="text-xs" />}
            className="text-muted-foreground hover:text-primary h-7 px-2"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Pending indicator */}
      {isPending && (
        <div className="text-xs text-muted-foreground flex items-center justify-end">
          <span className="animate-pulse">Updating results...</span>
        </div>
      )}
    </div>
  );
};
