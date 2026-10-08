import { isCountryCode } from "@/config/countries";
import { isCurrencyCode } from "@/config/currencies";
import { isISODate } from "@/lib/dates";
import type { BusinessDocument } from "@/types/document";

import { DOCUMENT_TYPES } from "./definitions";

type Data = Record<string, unknown>;

function isRecord(value: unknown): value is Data {
  return typeof value === "object" && value !== null;
}

const isString = (value: unknown): value is string => typeof value === "string";
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isAmount = (value: unknown) => Number.isSafeInteger(value) && (value as number) >= 0;
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isPercentage = (value: unknown) => isFiniteNumber(value) && value >= 0 && value <= 100;

const hasStrings = (value: unknown, keys: readonly string[]): value is Data =>
  isRecord(value) && keys.every((key) => isString(value[key]));

const PARTY_FIELDS = ["name", "email", "phone", "address", "taxId"] as const;

function isPaymentTerms(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.type === "on_receipt" || value.type === "custom") return true;
  return value.type === "net" && Number.isInteger(value.days) && (value.days as number) >= 0;
}

function isDiscount(value: unknown): boolean {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  if (value.type === "percentage") return isPercentage(value.value);
  return value.type === "fixed" && isAmount(value.amount);
}

function isPaymentOptions(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const { bankTransfer, paymentLink, qrCode } = value;
  return (
    hasStrings(bankTransfer, ["bankName", "accountName", "accountNumber", "instructions"]) &&
    isBoolean(bankTransfer.enabled) &&
    hasStrings(paymentLink, ["url"]) &&
    isBoolean(paymentLink.enabled) &&
    isBoolean(paymentLink.showButton) &&
    isRecord(qrCode) &&
    isBoolean(qrCode.enabled)
  );
}

function isBranding(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const { templateId, brandColor, logo } = value;
  return (
    isString(templateId) &&
    (brandColor === null || (isString(brandColor) && /^#[0-9a-f]{6}$/i.test(brandColor))) &&
    (logo === null || (isRecord(logo) && isString(logo.assetId)))
  );
}

/**
 * Checks documents read from outside the app (e.g. storage) field by field,
 * so corrupt, tampered or outdated data never reaches the calculations or
 * the renderer. An unknown template id is allowed (it falls back to the
 * default template). Whether the amounts are small enough to calculate is
 * checked separately (`isCalculable`).
 */
export function isBusinessDocument(value: unknown): value is BusinessDocument {
  if (!isRecord(value)) return false;
  const { business, client, tax, items } = value;
  return (
    hasStrings(value, ["id", "type", "number", "notes", "terms"]) &&
    Object.hasOwn(DOCUMENT_TYPES, value.type as string) &&
    isString(value.issueDate) &&
    isISODate(value.issueDate) &&
    isString(value.dueDate) &&
    isISODate(value.dueDate) &&
    isPaymentTerms(value.paymentTerms) &&
    isCurrencyCode(value.currency) &&
    hasStrings(business, [...PARTY_FIELDS, "locale"]) &&
    isCountryCode(business.country) &&
    hasStrings(client, PARTY_FIELDS) &&
    hasStrings(tax, ["label"]) &&
    isBoolean(tax.enabled) &&
    isPercentage(tax.rate) &&
    (tax.mode === "exclusive" || tax.mode === "inclusive") &&
    isDiscount(value.discount) &&
    isPaymentOptions(value.paymentOptions) &&
    isBranding(value.branding) &&
    Array.isArray(items) &&
    items.every(
      (item) =>
        hasStrings(item, ["id", "description"]) &&
        isFiniteNumber(item.quantity) &&
        item.quantity >= 0 &&
        isAmount(item.unitPrice),
    )
  );
}
