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
import { INDUSTRY_SECTOR_OPTIONS } from "@/shared/constants/employer-options";
import { FiSearch, FiX } from "react-icons/fi";

export const CompaniesFilter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");

  // Debounced search
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

      // reset page to 1 on any filter change
      current.delete("page");

      const queryStr = current.toString();
      const query = queryStr ? `?${queryStr}` : "";

      startTransition(() => {
        router.push(`${pathname}${query}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  // Sync state when URL search params change externally (maybe add global company search later)
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    debouncedUpdateSearch.cancel();

    setIndustry(searchParams.get("industry") || "");
    setCountry(searchParams.get("country") || "");
    setCity(searchParams.get("city") || "");
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

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIndustry(val);
    updateQueryParams({ industry: val });
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setCity("");
    updateQueryParams({ country: newCountry, city: undefined });
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    updateQueryParams({ city: newCity });
  };

  const handleClearFilters = () => {
    setSearch("");
    setIndustry("");
    setCountry("");
    setCity("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    search || industry || country || city,
  );

  const industryOptions = [
    { label: "All Industries", value: "" },
    ...INDUSTRY_SECTOR_OPTIONS,
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-2xl mb-6">
      {/*Search */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none" />
        <Input
          placeholder="Search companies by name..."
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

      {/* Select Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Country & City Dropdowns */}
        <CountryCitySelect
          country={country}
          city={city}
          onCountryChange={handleCountryChange}
          onCityChange={handleCityChange}
          allCountriesOptionLabel="All Countries"
          allCitiesOptionLabel="All Cities"
        />

        {/* Industry */}
        <Select
          options={industryOptions}
          value={industry}
          onChange={handleIndustryChange}
        />
      </div>

      {/*  Clear filters btn */}
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
