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
  "SY",
  "YE",
  "LB"
] as const;

export type AllowedCountryCode = (typeof ALLOWED_COUNTRY_CODES)[number];
