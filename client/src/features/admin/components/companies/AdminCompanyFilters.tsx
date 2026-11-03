"use client";

import React from "react";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Button } from "@/shared/components/ui/Button";
import { CountryCitySelect } from "@/shared/components/ui/CountryCitySelect";
import { MdSearch, MdClear } from "react-icons/md";
import { INDUSTRY_SECTOR_OPTIONS } from "@/shared/constants/employer-options";

interface AdminCompanyFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  country: string;
  onCountryChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  industry: string;
  onIndustryChange: (value: string) => void;
  onReset: () => void;
}

const INDUSTRY_OPTIONS = [
  { label: "All Industries", value: "" },
  ...INDUSTRY_SECTOR_OPTIONS,
];

export function AdminCompanyFilters({
  search,
  onSearchChange,
  country,
  onCountryChange,
  city,
  onCityChange,
  industry,
  onIndustryChange,
  onReset,
}: AdminCompanyFiltersProps) {
  const hasActiveFilters =
    Boolean(search) || Boolean(country) || Boolean(city) || Boolean(industry);

  return (
    <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search company name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none" />
        </div>

        {/* Location (Country & City) */}
        <CountryCitySelect
          country={country}
          city={city}
          onCountryChange={onCountryChange}
          onCityChange={onCityChange}
          allCountriesOptionLabel="All Countries"
          allCitiesOptionLabel="All Cities"
        />

        {/* Industry */}
        <Select
          value={industry}
          onChange={(e) => onIndustryChange(e.target.value)}
          options={INDUSTRY_OPTIONS}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <MdClear className="text-sm" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

