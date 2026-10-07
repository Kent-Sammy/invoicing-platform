import { DEFAULT_CURRENCY, type CurrencyCode } from "@/config/currencies";
import { DEFAULT_TAX_LABEL, getSuggestedTaxPreset } from "@/config/tax";
import { todayISODate } from "@/lib/dates";
import type {
  BusinessDocument,
  DocumentItem,
  DocumentTax,
  DocumentType,
  Party,
} from "@/types/document";
import type { TemplateId } from "@/types/template";

import { getDocumentType } from "./definitions";

export const DEFAULT_TEMPLATE_ID: TemplateId = "minimal";
export const DEFAULT_BRAND_COLOR = "#171717";

export function createId(): string {
  return crypto.randomUUID();
}

export function createParty(): Party {
  return { name: "", email: "", phone: "", address: "", taxId: "" };
}

export function createItem(): DocumentItem {
  return { id: createId(), description: "", quantity: 1, unitPrice: 0 };
}

/** Tax starts disabled; when the user enables it, the suggested rate is pre-filled. */
export function createTax(currency: CurrencyCode): DocumentTax {
  const preset = getSuggestedTaxPreset(currency);
  return {
    enabled: false,
    label: preset?.label ?? DEFAULT_TAX_LABEL,
    rate: preset?.rate ?? 0,
  };
}

export function createDocument(
  type: DocumentType = "invoice",
  { currency = DEFAULT_CURRENCY, today = todayISODate() } = {},
): BusinessDocument {
  return {
    id: createId(),
    type,
    number: `${getDocumentType(type).numberPrefix}0001`,
    issueDate: today,
    dueDate: null,
    currency,
    business: createParty(),
    client: createParty(),
    items: [createItem()],
    discount: null,
    tax: createTax(currency),
    notes: "",
    terms: "",
    branding: {
      templateId: DEFAULT_TEMPLATE_ID,
      brandColor: DEFAULT_BRAND_COLOR,
      logo: null,
    },
  };
}
