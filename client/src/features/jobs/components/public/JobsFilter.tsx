"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { CountryCitySelect } from "@/shared/components/ui/CountryCitySelect";
import { Button } from "@/shared/components/ui/Button";
import {
  FindAllExperienceLevel,
  FindAllJobType,
} from "@/shared/api/generated/model";
import { FiSearch, FiX, FiFilter, FiPlus, FiMinus, } from "react-icons/fi";

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

  const activeFilterCount = [
    country,
    city,
    expLevel,
    yearsOfExp,
    jobType,
  ].filter(Boolean).length;

  const [isExpanded, setIsExpanded] = useState(() => activeFilterCount > 0);

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

    const newCountry = searchParams.get("country") || "";
    const newCity = searchParams.get("city") || "";
    const newExp = searchParams.get("experienceLevel") || "";
    const newYears = searchParams.get("yearsOfExperience") || "";
    const newJobType = searchParams.get("jobType") || "";

    setCountry(newCountry);
    setCity(newCity);
    setExpLevel(newExp);
    setYearsOfExp(newYears);
    setJobType(newJobType);

    if (newCountry || newCity || newExp || newYears || newJobType) {
      setIsExpanded(true);
    }
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
    <div className="flex flex-col gap-3 p-4 bg-card border border-border rounded-2xl mb-6 shadow-xs">
      {/* Search input + Filter btn */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Input
            placeholder="Search jobs, machines..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none" />
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

        <Button
          type="button"
          variant={isExpanded ? "secondary" : "outline"}
          size="md"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="relative flex items-center justify-center gap-1 shrink-0 h-9 px-2 rounded-xl transition-all"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          title={isExpanded ? "Collapse filters" : "Expand filters"}
        >
          <FiFilter className="text-primary w-4 h-4 shrink-0" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm ring-2 ring-card z-10 pointer-events-none">
              {activeFilterCount}
            </span>
          )}
          <span className="text-muted-foreground flex items-center justify-center shrink-0">
            {isExpanded ? (
              <FiMinus className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <FiPlus className="w-3.5 h-3.5 shrink-0" />
            )}
          </span>
        </Button>
      </div>

      {/* Filter Dropdowns */}
      {isExpanded && (
        <div className="pt-3 border-t border-border/50 ">
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
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<FiX className="text-xs" />}
                className="text-muted-foreground hover:text-primary h-7 px-2"
              >
                Clear all filters
              </Button>
            </div>
          )}
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
