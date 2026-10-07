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
  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    Object.hasOwn(DOCUMENT_TYPES, value.type) &&
    typeof value.number === "string" &&
    typeof value.issueDate === "string" &&
    isCurrencyCode(value.currency) &&
    isRecord(value.business) &&
    isRecord(value.client) &&
    isRecord(value.tax) &&
    isRecord(value.branding) &&
    Array.isArray(value.items) &&
    value.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.quantity === "number" &&
        Number.isSafeInteger(item.unitPrice),
    )
  );
}
