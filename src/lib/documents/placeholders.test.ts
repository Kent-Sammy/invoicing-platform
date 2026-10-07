import { describe, expect, it } from "vitest";

import { createDocument } from "./create";
import { withPlaceholders } from "./placeholders";

const blank = createDocument("invoice", { today: "2026-10-07" });

describe("withPlaceholders", () => {
  it("fills an empty document with marked sample content", () => {
    const { document, placeholders } = withPlaceholders(blank);

    expect(document.business.name).toBe("Your Business");
    expect(document.client.name).toBe("Client Name");
    expect(document.items).toHaveLength(2);
    expect([...placeholders].sort()).toEqual([
      "business.address",
      "business.email",
      "business.name",
      "business.phone",
      "client.address",
      "client.email",
      "client.name",
      "items",
    ]);
  });

  it("prices sample items in the document currency's minor units", () => {
    const { document } = withPlaceholders({ ...blank, currency: "USD" });
    expect(document.items[0].unitPrice).toBe(25_000_000); // $250,000.00
  });

  it("stops sampling a party's contact fields once the user fills any of them", () => {
    const { document, placeholders } = withPlaceholders({
      ...blank,
      business: { ...blank.business, email: "me@studio.ng" },
    });

    expect(document.business.email).toBe("me@studio.ng");
    expect(document.business.phone).toBe("");
    expect(placeholders.has("business.phone")).toBe(false);
    // The name is always sampled while empty.
    expect(placeholders.has("business.name")).toBe(true);
  });

  it("uses real items as soon as one has a description or price", () => {
    const items = [{ ...blank.items[0], description: "Consulting" }];
    const { document, placeholders } = withPlaceholders({ ...blank, items });

    expect(document.items).toEqual(items);
    expect(placeholders.has("items")).toBe(false);
  });

  it("returns the document untouched when nothing is missing", () => {
    const filled = {
      ...blank,
      business: { ...blank.business, name: "Studio" },
      client: { ...blank.client, name: "Client" },
      items: [{ ...blank.items[0], unitPrice: 100 }],
    };
    const result = withPlaceholders(filled);

    expect(result.document).toBe(filled);
    expect(result.placeholders.size).toBe(0);
  });
});
