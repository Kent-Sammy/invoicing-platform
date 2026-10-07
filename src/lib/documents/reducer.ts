import { getCountry } from "@/config/countries";
import type {
  Business,
  BusinessDocument,
  DocumentBranding,
  DocumentItem,
  DocumentTax,
  Party,
  PaymentDetails,
} from "@/types/document";

import { dueDateFor } from "./payment-terms";

type DocumentFields = Omit<
  BusinessDocument,
  "id" | "type" | "business" | "client" | "items" | "tax" | "paymentDetails" | "branding"
>;

export type DocumentAction =
  | { type: "replace"; document: BusinessDocument }
  | { type: "update"; changes: Partial<DocumentFields> }
  | { type: "updateBusiness"; changes: Partial<Business> }
  | { type: "updateClient"; changes: Partial<Party> }
  | { type: "updateTax"; changes: Partial<DocumentTax> }
  | { type: "updatePaymentDetails"; changes: Partial<PaymentDetails> }
  | { type: "updateBranding"; changes: Partial<DocumentBranding> }
  | { type: "addItem"; item: DocumentItem }
  | { type: "updateItem"; id: string; changes: Partial<Omit<DocumentItem, "id">> }
  | { type: "removeItem"; id: string };

/**
 * Keeps issue date, due date and payment terms consistent:
 * - picking a due date directly switches the terms to custom;
 * - otherwise, changing the issue date or terms re-derives the due date.
 */
function applyDateRules(
  document: BusinessDocument,
  changes: Partial<DocumentFields>,
): BusinessDocument {
  if ("dueDate" in changes && !("paymentTerms" in changes)) {
    return { ...document, paymentTerms: { type: "custom" } };
  }
  if ("issueDate" in changes || "paymentTerms" in changes) {
    const dueDate = dueDateFor(document.issueDate, document.paymentTerms);
    if (dueDate) return { ...document, dueDate };
  }
  return document;
}

/** Changing the business country also moves the locale, unless one is given. */
function updateBusiness(business: Business, changes: Partial<Business>): Business {
  const next = { ...business, ...changes };
  if (changes.country && !changes.locale && changes.country !== business.country) {
    next.locale = getCountry(changes.country).locale;
  }
  return next;
}

/** Pure state transitions for the document being edited. */
export function documentReducer(
  document: BusinessDocument,
  action: DocumentAction,
): BusinessDocument {
  switch (action.type) {
    case "replace":
      return action.document;
    case "update":
      return applyDateRules({ ...document, ...action.changes }, action.changes);
    case "updateBusiness":
      return { ...document, business: updateBusiness(document.business, action.changes) };
    case "updateClient":
      return { ...document, client: { ...document.client, ...action.changes } };
    case "updateTax":
      return { ...document, tax: { ...document.tax, ...action.changes } };
    case "updatePaymentDetails":
      return {
        ...document,
        paymentDetails: { ...document.paymentDetails, ...action.changes },
      };
    case "updateBranding":
      return { ...document, branding: { ...document.branding, ...action.changes } };
    case "addItem":
      return { ...document, items: [...document.items, action.item] };
    case "updateItem":
      return {
        ...document,
        items: document.items.map((item) =>
          item.id === action.id ? { ...item, ...action.changes } : item,
        ),
      };
    case "removeItem":
      return { ...document, items: document.items.filter((item) => item.id !== action.id) };
  }
}
