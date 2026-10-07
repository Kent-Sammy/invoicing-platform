import { getCountry } from "@/config/countries";
import type {
  BankTransferOption,
  Business,
  BusinessDocument,
  DocumentBranding,
  DocumentItem,
  DocumentTax,
  Party,
  PaymentLinkOption,
  PaymentOptions,
  QrCodeOption,
} from "@/types/document";

import { dueDateFor } from "./payment-terms";

type DocumentFields = Omit<
  BusinessDocument,
  "id" | "type" | "business" | "client" | "items" | "tax" | "paymentOptions" | "branding"
>;

export type DocumentAction =
  | { type: "replace"; document: BusinessDocument }
  | { type: "update"; changes: Partial<DocumentFields> }
  | { type: "updateBusiness"; changes: Partial<Business> }
  | { type: "updateClient"; changes: Partial<Party> }
  | { type: "updateTax"; changes: Partial<DocumentTax> }
  | { type: "updateBankTransfer"; changes: Partial<BankTransferOption> }
  | { type: "updatePaymentLink"; changes: Partial<PaymentLinkOption> }
  | { type: "updateQrCode"; changes: Partial<QrCodeOption> }
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

function withPaymentOptions(
  document: BusinessDocument,
  changes: Partial<PaymentOptions>,
): BusinessDocument {
  return { ...document, paymentOptions: { ...document.paymentOptions, ...changes } };
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
    case "updateBankTransfer":
      return withPaymentOptions(document, {
        bankTransfer: { ...document.paymentOptions.bankTransfer, ...action.changes },
      });
    case "updatePaymentLink":
      return withPaymentOptions(document, {
        paymentLink: { ...document.paymentOptions.paymentLink, ...action.changes },
      });
    case "updateQrCode":
      return withPaymentOptions(document, {
        qrCode: { ...document.paymentOptions.qrCode, ...action.changes },
      });
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
