import type { CountryCode } from "@/config/countries";
import type { CurrencyCode } from "@/config/currencies";
import type { MinorUnits } from "@/lib/money";

import type { AssetRef } from "./asset";
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

export interface Business extends Party {
  country: CountryCode;
  /** BCP 47 locale for dates and document language, e.g. "en-NG". Independent of currency. */
  locale: string;
}

export type Client = Party;

export interface DocumentItem {
  id: string;
  description: string;
  /** May be fractional (e.g. 1.5 hours). Calculations support up to 4 decimal places. */
  quantity: number;
  /** In tax-inclusive mode this price already includes tax. */
  unitPrice: MinorUnits;
}

export type Discount =
  | { type: "percentage"; value: Percentage }
  | { type: "fixed"; amount: MinorUnits };

/**
 * exclusive: prices are net, tax is added on top.
 * inclusive: prices already contain tax, which is extracted for display.
 */
export type TaxMode = "exclusive" | "inclusive";

/** Document-level tax. Line-level tax can be added to DocumentItem later. */
export interface DocumentTax {
  enabled: boolean;
  label: string;
  rate: Percentage;
  mode: TaxMode;
}

/**
 * How the due date relates to the issue date. While terms are not "custom",
 * changing the issue date moves the due date with it.
 */
export type PaymentTerms =
  | { type: "on_receipt" }
  | { type: "net"; days: number }
  | { type: "custom" };

/**
 * Bank details the business chooses to print so the client can pay.
 * Display text, not payment credentials. Empty fields are omitted.
 */
export interface BankTransferOption {
  enabled: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

/** Any payment URL (Paystack, Flutterwave, Stripe, a bank page…). Provider-agnostic. */
export interface PaymentLinkOption {
  enabled: boolean;
  url: string;
  /** Show a "Pay invoice" button linking to the URL. */
  showButton: boolean;
}

/** A QR code encoding the payment link — never configured separately from it. */
export interface QrCodeOption {
  enabled: boolean;
}

/**
 * How the client can pay. Each method is independent and optional; a
 * document with none enabled is perfectly valid. New methods (provider
 * integrations, payment status) are added as further keys.
 */
export interface PaymentOptions {
  bankTransfer: BankTransferOption;
  paymentLink: PaymentLinkOption;
  qrCode: QrCodeOption;
}

export interface DocumentBranding {
  templateId: TemplateId;
  /** Hex colour, e.g. "#171717". */
  brandColor: string;
  /** Reference to a stored logo asset — never the image data itself. */
  logo: AssetRef | null;
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
  dueDate: ISODate;
  paymentTerms: PaymentTerms;
  currency: CurrencyCode;
  business: Business;
  client: Client;
  items: DocumentItem[];
  discount: Discount | null;
  tax: DocumentTax;
  paymentOptions: PaymentOptions;
  notes: string;
  terms: string;
  branding: DocumentBranding;
}
