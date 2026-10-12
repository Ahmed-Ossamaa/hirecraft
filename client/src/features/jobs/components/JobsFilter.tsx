"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input, Select, CountryCitySelect } from "@/shared/components/ui";
import { FindAllExperienceLevel, FindAllJobType } from "@/shared/api/generated/model";
import { FiSearch } from "react-icons/fi";

export const JobsFilter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [countryCode, setCountryCode] = useState(searchParams.get("country") || "");
  const [cityName, setCityName] = useState(searchParams.get("city") || "");
  const [expLevel, setExpLevel] = useState(searchParams.get("experienceLevel") || "");
  const [yearsOfExp, setYearsOfExp] = useState(searchParams.get("yearsOfExperience") || "");
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
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    setSearch(currentSearch);
    debouncedUpdateSearch.cancel();

    setCountryCode(searchParams.get("country") || "");
    setCityName(searchParams.get("city") || "");
    setExpLevel(searchParams.get("experienceLevel") || "");
    setYearsOfExp(searchParams.get("yearsOfExperience") || "");
    setJobType(searchParams.get("jobType") || "");
  }, [searchParams, debouncedUpdateSearch]);

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
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs, machines..."
          value={search}
          onChange={(e) => {
            const val = e.target.value;
            setSearch(val);
            debouncedUpdateSearch(val);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              debouncedUpdateSearch.flush();
            }
          }}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Country & City */}
        <CountryCitySelect
          countryCode={countryCode}
          cityName={cityName}
          onCountryChange={(val) => {
            setCountryCode(val);
            setCityName(""); // Reset city when country changes
            updateQueryParams({ country: val, city: "" });
          }}
          onCityChange={(val) => {
            setCityName(val);
            updateQueryParams({ city: val });
          }}
        />

        {/* Experience Level */}
        <Select
          value={expLevel}
          options={expLevelOptions}
          onChange={(e) => {
            const val = e.target.value;
            setExpLevel(val);
            updateQueryParams({ experienceLevel: val });
          }}
        />

        {/* Years of Experience */}
        <Select
          value={yearsOfExp}
          options={yearsOfExpOptions}
          onChange={(e) => {
            const val = e.target.value;
            setYearsOfExp(val);
            updateQueryParams({ yearsOfExperience: val });
          }}
        />

        {/* Job Type */}
        <Select
          value={jobType}
          options={jobTypeOptions}
          onChange={(e) => {
            const val = e.target.value;
            setJobType(val);
            updateQueryParams({ jobType: val });
          }}
        />
      </div>

      
      {isPending && (
        <div className="text-xs text-muted-foreground flex items-center justify-end">
          <span className="animate-pulse">Updating results...</span>
        </div>
      )}
    </div>
  );
};
