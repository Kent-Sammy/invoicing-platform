import type { BusinessDocument } from "@/types/document";

/** The minimum a document needs before it's worth saving as a PDF. */
export type MissingRequirement = "business.name" | "client.name" | "items" | "number";

const blank = (value: string) => value.trim() === "";

/**
 * What's still missing for a meaningful document. Sample content in the
 * preview never prints, so without these the PDF would have no sender, no
 * recipient or nothing to pay for.
 */
export function missingRequirements(document: BusinessDocument): MissingRequirement[] {
  const missing: MissingRequirement[] = [];
  if (blank(document.business.name)) missing.push("business.name");
  if (blank(document.client.name)) missing.push("client.name");
  if (!document.items.some((item) => !blank(item.description))) missing.push("items");
  if (blank(document.number)) missing.push("number");
  return missing;
}

const MISSING_PHRASES: Record<MissingRequirement, string> = {
  "business.name": "your business name",
  "client.name": "a client",
  items: "an item",
  number: "an invoice number",
};

/** "Add your business name, a client and an item to review." */
export function describeMissing(missing: readonly MissingRequirement[], action = "to review"): string {
  const phrases = missing.map((requirement) => MISSING_PHRASES[requirement]);
  const list =
    phrases.length > 1 ? `${phrases.slice(0, -1).join(", ")} and ${phrases.at(-1)}` : (phrases[0] ?? "");
  return `Add ${list} ${action}.`;
}

/**
 * True once work on this particular invoice has started — anything beyond
 * the business profile it was created from. A fresh invoice starts at the
 * template step; one in progress resumes where the work is.
 */
export function hasInvoiceContent(document: BusinessDocument): boolean {
  const { client, items, notes, terms } = document;
  return (
    [client.name, client.email, client.phone, client.address, client.taxId, notes, terms].some(
      (value) => !blank(value),
    ) || items.some((item) => !blank(item.description) || item.unitPrice > 0)
  );
}
