/**
 * A suggested tax rate shown to the user as a convenience. These are
 * pre-filled defaults for document generation, not tax or legal advice —
 * the user always decides the rate that appears on their document.
 */
export interface TaxPreset {
  id: string;
  label: string;
  /** Percentage: 7.5 means 7.5%. */
  rate: number;
}

export const TAX_PRESETS = {
  "ng-vat": { id: "ng-vat", label: "VAT", rate: 7.5 },
} as const satisfies Record<string, TaxPreset>;

export type TaxPresetId = keyof typeof TAX_PRESETS;

export const DEFAULT_TAX_LABEL = "Tax";

export function getTaxPreset(id: TaxPresetId | null): TaxPreset | null {
  return id ? TAX_PRESETS[id] : null;
}
