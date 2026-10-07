import type { CurrencyCode } from "@/config/currencies";
import type { MinorUnits } from "@/lib/money";

import type { TemplateId } from "./template";

/** Calendar date in ISO 8601 form, e.g. "2026-10-07". No time, no timezone. */
export type ISODate = string;

/** A percentage as the user enters it: 7.5 means 7.5%. */
export type Percentage = number;

/** Document types the app can produce. Quote, estimate, proforma and receipt come later. */
export type DocumentType = "invoice";

/** Contact details shared by the issuing business and the client. */
export interface Party {
  name: string;
  email: string;
  phone: string;
  /** Free-form, multi-line address — formats vary too much by country to structure yet. */
  address: string;
  /** VAT / TIN / company number, as the user writes it. */
  taxId: string;
}

export type Business = Party;
export type Client = Party;

export interface DocumentItem {
  id: string;
  description: string;
  /** May be fractional (e.g. 1.5 hours). Calculations support up to 4 decimal places. */
  quantity: number;
  unitPrice: MinorUnits;
}

export type Discount =
  | { type: "percentage"; value: Percentage }
  | { type: "fixed"; amount: MinorUnits };

/** Document-level tax. Line-level tax can be added to DocumentItem later. */
export interface DocumentTax {
  enabled: boolean;
  label: string;
  rate: Percentage;
}

export interface DocumentBranding {
  templateId: TemplateId;
  /** Hex colour, e.g. "#171717". */
  brandColor: string;
  /** Data URL of the uploaded logo, or null. */
  logo: string | null;
}

/**
 * The single source of truth for a business document. Named BusinessDocument
 * rather than Document to avoid shadowing the DOM's global Document type.
 */
export interface BusinessDocument {
  id: string;
  type: DocumentType;
  number: string;
  issueDate: ISODate;
  dueDate: ISODate | null;
  currency: CurrencyCode;
  business: Business;
  client: Client;
  items: DocumentItem[];
  discount: Discount | null;
  tax: DocumentTax;
  notes: string;
  terms: string;
  branding: DocumentBranding;
}
