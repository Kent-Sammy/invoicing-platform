import type { CurrencyCode } from "./currencies";
import type { TaxPresetId } from "./tax";

export interface CountryDefinition {
  /** ISO 3166-1 alpha-2 code. */
  code: string;
  name: string;
  /** Default locale for a business in this country (dates, document language). */
  locale: string;
  defaultCurrency: CurrencyCode;
  /** Suggested tax for businesses in this country, if any. */
  taxPresetId: TaxPresetId | null;
}

/** Supported business countries. To add one, add an entry here. */
export const COUNTRIES = {
  NG: { code: "NG", name: "Nigeria", locale: "en-NG", defaultCurrency: "NGN", taxPresetId: "ng-vat" },
  GB: { code: "GB", name: "United Kingdom", locale: "en-GB", defaultCurrency: "GBP", taxPresetId: null },
  US: { code: "US", name: "United States", locale: "en-US", defaultCurrency: "USD", taxPresetId: null },
} as const satisfies Record<string, CountryDefinition>;

export type CountryCode = keyof typeof COUNTRIES;

export const DEFAULT_COUNTRY: CountryCode = "NG";

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && Object.hasOwn(COUNTRIES, value);
}

export function getCountry(code: CountryCode): CountryDefinition {
  return COUNTRIES[code];
}
