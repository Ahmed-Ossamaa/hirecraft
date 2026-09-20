export const ALLOWED_COUNTRY_CODES = [
  "EG",
  "SA",
  "AE",
  "OM",
  "JO",
  "IQ",
  "QA",
  "KW",
  "BH",
  "LY",
] as const;

export type AllowedCountryCode = (typeof ALLOWED_COUNTRY_CODES)[number];
