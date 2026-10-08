import { describe, expect, it } from "vitest";

import { createSampleDocument, createStressDocument } from "@/data/sample-document";
import { isCalculable } from "@/lib/calculations";
import type { BusinessDocument } from "@/types/document";

import { createDocument } from "./create";
import { describeMissing, hasInvoiceContent, missingRequirements } from "./readiness";
import { documentReducer } from "./reducer";
import { isBusinessDocument } from "./validate";

const corrupt = (change: (document: Record<string, unknown>) => void) => {
  const document = structuredClone(createSampleDocument()) as unknown as Record<string, unknown>;
  change(document);
  return document;
};

describe("draft validation", () => {
  it("accepts real documents", () => {
    expect(isBusinessDocument(createSampleDocument())).toBe(true);
    expect(isBusinessDocument(createStressDocument())).toBe(true);
    expect(isBusinessDocument(createDocument())).toBe(true);
  });

  it.each([
    ["a non-finite quantity", (d: Record<string, unknown>) => ((d.items as { quantity: unknown }[])[0].quantity = NaN)],
    ["a negative quantity", (d: Record<string, unknown>) => ((d.items as { quantity: unknown }[])[0].quantity = -1)],
    ["a fractional amount", (d: Record<string, unknown>) => ((d.items as { unitPrice: unknown }[])[0].unitPrice = 1.5)],
    ["a missing description", (d: Record<string, unknown>) => delete (d.items as Record<string, unknown>[])[0].description],
    ["a tax rate over 100%", (d: Record<string, unknown>) => ((d.tax as { rate: unknown }).rate = 150)],
    ["a string tax rate", (d: Record<string, unknown>) => ((d.tax as { rate: unknown }).rate = "7.5")],
    ["a malformed discount", (d: Record<string, unknown>) => (d.discount = { type: "percentage", value: "10" })],
    ["an impossible date", (d: Record<string, unknown>) => (d.issueDate = "2026-02-31")],
    ["unknown payment terms", (d: Record<string, unknown>) => (d.paymentTerms = { type: "net", days: -3 })],
    ["a non-hex brand colour", (d: Record<string, unknown>) => ((d.branding as { brandColor: unknown }).brandColor = "red")],
    ["a missing client field", (d: Record<string, unknown>) => delete (d.client as Record<string, unknown>).email],
    ["missing notes", (d: Record<string, unknown>) => delete d.notes],
  ])("rejects %s", (_, change) => {
    expect(isBusinessDocument(corrupt(change))).toBe(false);
  });
});

describe("calculation limits", () => {
  it("accepts the largest allowed amounts", () => {
    expect(isCalculable(createStressDocument())).toBe(true);
  });

  it("refuses totals outside the exact range", () => {
    const document = createSampleDocument();
    document.items[0] = { ...document.items[0], quantity: 1_000_000, unitPrice: 99_999_999_999_999 };
    expect(isCalculable(document)).toBe(false);
  });
});

describe("due date", () => {
  const custom = (): BusinessDocument =>
    documentReducer(createDocument("invoice", { today: "2026-10-07" }), {
      type: "update",
      changes: { dueDate: "2026-10-10" },
    });

  it("moves with the issue date when a custom due date would fall before it", () => {
    const next = documentReducer(custom(), { type: "update", changes: { issueDate: "2026-10-20" } });
    expect(next.paymentTerms).toEqual({ type: "custom" });
    expect(next.dueDate).toBe("2026-10-20");
  });

  it("keeps a custom due date that is still after the issue date", () => {
    const next = documentReducer(custom(), { type: "update", changes: { issueDate: "2026-10-08" } });
    expect(next.dueDate).toBe("2026-10-10");
  });

  it("never accepts a due date before the issue date", () => {
    const next = documentReducer(custom(), { type: "update", changes: { dueDate: "2026-09-01" } });
    expect(next.dueDate).toBe("2026-10-07");
  });
});

describe("print readiness", () => {
  it("lists what an empty invoice is missing", () => {
    expect(missingRequirements(createDocument())).toEqual(["business.name", "client.name", "items"]);
  });

  it("is satisfied by a complete invoice", () => {
    expect(missingRequirements(createSampleDocument())).toEqual([]);
  });

  it("needs an item with a description, not just a price", () => {
    const document = createSampleDocument();
    document.items = [{ ...document.items[0], description: "  " }];
    expect(missingRequirements(document)).toEqual(["items"]);
  });

  it("needs an invoice number", () => {
    expect(missingRequirements({ ...createSampleDocument(), number: " " })).toEqual(["number"]);
  });
});

describe("journey helpers", () => {
  it("describes what's missing in one sentence", () => {
    expect(describeMissing(["business.name", "client.name", "items"])).toBe(
      "Add your business name, a client and an item to review.",
    );
    expect(describeMissing(["client.name"], "first")).toBe("Add a client first.");
  });

  it("treats an invoice as started once it has invoice-specific content", () => {
    const fresh = createDocument();
    expect(hasInvoiceContent(fresh)).toBe(false);
    // Business details alone (the carried-over profile) don't count.
    expect(hasInvoiceContent({ ...fresh, business: { ...fresh.business, name: "Studio" } })).toBe(false);
    expect(hasInvoiceContent({ ...fresh, client: { ...fresh.client, name: "Harbour" } })).toBe(true);
    expect(hasInvoiceContent({ ...fresh, items: [{ ...fresh.items[0], unitPrice: 100 }] })).toBe(true);
  });
});
