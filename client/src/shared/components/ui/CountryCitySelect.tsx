import React from "react";
import { Select } from "./Select";
import { COUNTRIES } from "@/shared/constants/location";

export interface CountryCitySelectProps {
  country?: string;
  city?: string;
  countryCode?: string;
  cityName?: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  countryLabel?: string;
  cityLabel?: string;
  allCountriesOptionLabel?: string;
  allCitiesOptionLabel?: string;
  className?: string;
  disabled?: boolean;
  countryError?: string;
  cityError?: string;
}

export const CountryCitySelect: React.FC<CountryCitySelectProps> = ({
  country,
  city,
  countryCode,
  cityName,
  onCountryChange,
  onCityChange,
  countryLabel,
  cityLabel,
  allCountriesOptionLabel = "All Countries",
  allCitiesOptionLabel = "All Cities",
  className,
  disabled = false,
  countryError,
  cityError,
}) => {
  const selectedCountry = country ?? countryCode ?? "";
  const selectedCity = city ?? cityName ?? "";

  const activeCountry = COUNTRIES.find((c) => c.name === selectedCountry);
  const cities = activeCountry ? activeCountry.cities : [];

  const countryOptions = [
    { label: allCountriesOptionLabel, value: "" },
    ...COUNTRIES.map((c) => ({ label: c.name, value: c.name })),
  ];

  const cityOptions = [
    { label: allCitiesOptionLabel, value: "" },
    ...cities.map((c) => ({ label: c, value: c })),
  ];

  return (
    <React.Fragment>
      <Select
        label={countryLabel}
        value={selectedCountry}
        options={countryOptions}
        disabled={disabled}
        onChange={(e) => onCountryChange(e.target.value)}
        className={className}
        error={countryError}
      />
      <Select
        label={cityLabel}
        value={selectedCity}
        options={cityOptions}
        disabled={disabled || !selectedCountry || cities.length === 0}
        onChange={(e) => onCityChange(e.target.value)}
        className={className}
        error={cityError}
      />
    </React.Fragment>
  );
};
