import { isCountryCode } from "@/config/countries";
import { isCurrencyCode } from "@/config/currencies";
import type { BusinessDocument } from "@/types/document";

import { DOCUMENT_TYPES } from "./definitions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Structural check for documents read from outside the app (e.g. storage).
 * Guards against corrupt or outdated data reaching the renderer; it is not
 * a full schema validation.
 */
export function isBusinessDocument(value: unknown): value is BusinessDocument {
  if (!isRecord(value)) return false;
  const { business, tax, paymentTerms, paymentDetails, branding, items } = value;
  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    Object.hasOwn(DOCUMENT_TYPES, value.type) &&
    typeof value.number === "string" &&
    typeof value.issueDate === "string" &&
    typeof value.dueDate === "string" &&
    isRecord(paymentTerms) &&
    typeof paymentTerms.type === "string" &&
    isCurrencyCode(value.currency) &&
    isRecord(business) &&
    isCountryCode(business.country) &&
    typeof business.locale === "string" &&
    isRecord(value.client) &&
    isRecord(tax) &&
    (tax.mode === "exclusive" || tax.mode === "inclusive") &&
    isRecord(paymentDetails) &&
    isRecord(branding) &&
    (branding.logo === null || (isRecord(branding.logo) && typeof branding.logo.assetId === "string")) &&
    Array.isArray(items) &&
    items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.quantity === "number" &&
        Number.isSafeInteger(item.unitPrice),
    )
  );
}
