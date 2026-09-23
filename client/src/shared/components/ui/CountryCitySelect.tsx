import React from "react";
import { Country, City } from "country-state-city";
import { Select } from "./Select";
import { ALLOWED_COUNTRY_CODES } from "@/shared/constants/location";

export interface CountryCitySelectProps {
  countryCode: string;
  cityName: string;
  onCountryChange: (countryCode: string) => void;
  onCityChange: (cityName: string) => void;
  countryLabel?: string;
  cityLabel?: string;
  allCountriesOptionLabel?: string;
  allCitiesOptionLabel?: string;
  className?: string;
  disabled?: boolean;
  allowedCountries?: readonly string[];
  countryError?: string;
  cityError?: string;
}

export const CountryCitySelect: React.FC<CountryCitySelectProps> = ({
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
  allowedCountries = ALLOWED_COUNTRY_CODES,
  countryError,
  cityError,
}) => {
  const countries = Country.getAllCountries().filter((c) =>
    allowedCountries.includes(c.isoCode)
  );
  const cities = countryCode ? City.getCitiesOfCountry(countryCode) || [] : [];

  const countryOptions = [
    { label: allCountriesOptionLabel, value: "" },
    ...countries.map((c) => ({ label: c.name, value: c.isoCode })),
  ];

  const cityOptions = [
    { label: allCitiesOptionLabel, value: "" },
    ...cities.map((c) => ({ label: c.name, value: c.name })),
  ];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onCountryChange(val);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCityChange(e.target.value);
  };

  return (
    <React.Fragment>
      <Select
        label={countryLabel}
        value={countryCode}
        options={countryOptions}
        disabled={disabled}
        onChange={handleCountryChange}
        className={className}
        error={countryError}
      />
      <Select
        label={cityLabel}
        value={cityName}
        options={cityOptions}
        disabled={disabled || !countryCode || cities.length === 0}
        onChange={handleCityChange}
        className={className}
        error={cityError}
      />
    </React.Fragment>
  );
};
