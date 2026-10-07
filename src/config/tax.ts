import type { CurrencyCode } from "./currencies";

/**
 * A suggested tax rate shown to the user as a convenience. These are
 * pre-filled defaults for document generation, not tax or legal advice —
 * the user always decides the rate that appears on their document.
 */
export interface TaxPreset {
  id: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  label: string;
  /** Percentage: 7.5 means 7.5%. */
  rate: number;
}

export const TAX_PRESETS = {
  "ng-vat": { id: "ng-vat", country: "NG", label: "VAT", rate: 7.5 },
} as const satisfies Record<string, TaxPreset>;

export type TaxPresetId = keyof typeof TAX_PRESETS;

// Until businesses have a country, the document currency is our best signal
// for which suggestion to offer.
const SUGGESTED_PRESET_BY_CURRENCY: Partial<Record<CurrencyCode, TaxPresetId>> = {
  NGN: "ng-vat",
};

export const DEFAULT_TAX_LABEL = "Tax";

export function getSuggestedTaxPreset(currency: CurrencyCode): TaxPreset | null {
  const id = SUGGESTED_PRESET_BY_CURRENCY[currency];
  return id ? TAX_PRESETS[id] : null;
}
