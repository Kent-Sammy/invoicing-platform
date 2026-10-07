import { DEFAULT_COUNTRY, getCountry, type CountryCode } from "@/config/countries";
import { DEFAULT_PAYMENT_TERMS } from "@/config/payment-terms";
import { DEFAULT_TAX_LABEL, getTaxPreset } from "@/config/tax";
import { todayISODate } from "@/lib/dates";
import { formatDocumentNumber } from "@/lib/numbering/format";
import type {
  Business,
  BusinessDocument,
  DocumentItem,
  DocumentTax,
  DocumentType,
  Party,
  PaymentOptions,
  PaymentTerms,
} from "@/types/document";
import type { TemplateId } from "@/types/template";

import { getDocumentType } from "./definitions";
import { dueDateFor } from "./payment-terms";

export const DEFAULT_TEMPLATE_ID: TemplateId = "minimal";

export function createId(): string {
  return crypto.randomUUID();
}

export function createParty(): Party {
  return { name: "", email: "", phone: "", address: "", taxId: "" };
}

export function createBusiness(country: CountryCode = DEFAULT_COUNTRY): Business {
  return { ...createParty(), country, locale: getCountry(country).locale };
}

export function createItem(): DocumentItem {
  return { id: createId(), description: "", quantity: 1, unitPrice: 0 };
}

/** All payment options start off: a document needs none to be valid. */
export function createPaymentOptions(): PaymentOptions {
  return {
    bankTransfer: { enabled: false, bankName: "", accountName: "", accountNumber: "", instructions: "" },
    paymentLink: { enabled: false, url: "", showButton: true },
    qrCode: { enabled: false },
  };
}

/** Tax starts disabled; when the user enables it, the country's suggestion is pre-filled. */
export function createTax(country: CountryCode = DEFAULT_COUNTRY): DocumentTax {
  const preset = getTaxPreset(getCountry(country).taxPresetId);
  return {
    enabled: false,
    label: preset?.label ?? DEFAULT_TAX_LABEL,
    rate: preset?.rate ?? 0,
    mode: "exclusive",
  };
}

interface CreateDocumentOptions {
  /** Allocated by a DocumentNumberSequence; defaults to the first number. */
  number?: string;
  country?: CountryCode;
  today?: string;
  paymentTerms?: PaymentTerms;
}

export function createDocument(
  type: DocumentType = "invoice",
  {
    number,
    country = DEFAULT_COUNTRY,
    today = todayISODate(),
    paymentTerms = DEFAULT_PAYMENT_TERMS,
  }: CreateDocumentOptions = {},
): BusinessDocument {
  return {
    id: createId(),
    type,
    number: number ?? formatDocumentNumber(getDocumentType(type).numberPrefix, 1),
    issueDate: today,
    dueDate: dueDateFor(today, paymentTerms) ?? today,
    paymentTerms,
    currency: getCountry(country).defaultCurrency,
    business: createBusiness(country),
    client: createParty(),
    items: [createItem()],
    discount: null,
    tax: createTax(country),
    paymentOptions: createPaymentOptions(),
    notes: "",
    terms: "",
    branding: {
      templateId: DEFAULT_TEMPLATE_ID,
      brandColor: null,
      logo: null,
    },
  };
}
