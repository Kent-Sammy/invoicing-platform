import { getCurrency } from "@/config/currencies";
import { toSafeInteger } from "@/lib/money";
import type { BusinessDocument, DocumentItem, Party } from "@/types/document";

/** Fields that can show sample content in the preview until the user fills them. */
export type PlaceholderField =
  | "business.name"
  | "business.email"
  | "business.phone"
  | "business.address"
  | "client.name"
  | "client.email"
  | "client.address"
  | "items";

const SAMPLE_BUSINESS = {
  name: "Your Business",
  email: "hello@yourbusiness.com",
  phone: "+234 800 000 0000",
  address: "12 Example Street\nLagos",
};

const SAMPLE_CLIENT = {
  name: "Client Name",
  email: "client@example.com",
  address: "Client address",
};

// Prices in major units; converted to the document currency's minor units.
const SAMPLE_ITEMS: { description: string; quantity: number; unitPrice: number }[] = [
  { description: "Brand identity design", quantity: 1, unitPrice: 250_000 },
  { description: "Website design", quantity: 2, unitPrice: 120_000 },
];

const isBlank = (value: string) => value.trim() === "";

function isEmptyParty(party: Pick<Party, "name" | "email" | "phone" | "address" | "taxId">) {
  return [party.name, party.email, party.phone, party.address, party.taxId].every(isBlank);
}

function isBlankItem(item: DocumentItem) {
  return isBlank(item.description) && item.unitPrice === 0;
}

/**
 * Fills empty parts of a document with tasteful sample content for the live
 * preview, and reports which fields are samples so templates can mark them
 * (and print can omit them). Rules:
 * - a name is always sampled when empty;
 * - other contact fields are sampled only while the whole party is empty,
 *   so the preview never nags about fields the user chose to skip;
 * - line items are sampled while every item is blank.
 */
export function withPlaceholders(document: BusinessDocument): {
  document: BusinessDocument;
  placeholders: ReadonlySet<PlaceholderField>;
} {
  const placeholders = new Set<PlaceholderField>();
  const business = { ...document.business };
  const client = { ...document.client };

  const businessEmpty = isEmptyParty(business);
  for (const field of ["name", "email", "phone", "address"] as const) {
    if (isBlank(business[field]) && (field === "name" || businessEmpty)) {
      business[field] = SAMPLE_BUSINESS[field];
      placeholders.add(`business.${field}`);
    }
  }

  const clientEmpty = isEmptyParty(client);
  for (const field of ["name", "email", "address"] as const) {
    if (isBlank(client[field]) && (field === "name" || clientEmpty)) {
      client[field] = SAMPLE_CLIENT[field];
      placeholders.add(`client.${field}`);
    }
  }

  let items = document.items;
  if (items.every(isBlankItem)) {
    const scale = 10n ** BigInt(getCurrency(document.currency).minorUnits);
    items = SAMPLE_ITEMS.map((item, index) => ({
      id: `placeholder-${index}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: toSafeInteger(BigInt(item.unitPrice) * scale),
    }));
    placeholders.add("items");
  }

  if (placeholders.size === 0) return { document, placeholders };
  return { document: { ...document, business, client, items }, placeholders };
}
