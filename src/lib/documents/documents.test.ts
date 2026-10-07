import { describe, expect, it } from "vitest";

import { createSampleDocument } from "@/data/sample-document";

import { createDocument } from "./create";
import { createDocumentView } from "./view";

describe("createDocument", () => {
  it("defaults to an NGN invoice with VAT suggested but not applied", () => {
    const document = createDocument("invoice", { today: "2026-10-07" });

    expect(document.currency).toBe("NGN");
    expect(document.number).toBe("INV-0001");
    expect(document.issueDate).toBe("2026-10-07");
    expect(document.tax).toEqual({ enabled: false, label: "VAT", rate: 7.5 });
    expect(document.items).toHaveLength(1);
  });

  it("suggests no tax rate for currencies without a preset", () => {
    expect(createDocument("invoice", { currency: "USD" }).tax).toEqual({
      enabled: false,
      label: "Tax",
      rate: 0,
    });
  });
});

describe("createDocumentView", () => {
  it("formats amounts, dates and labels for templates", () => {
    const view = createDocumentView(createSampleDocument());

    expect(view.title).toBe("Invoice");
    expect(view.issueDate).toBe("7 Oct 2026");
    expect(view.items[2]).toMatchObject({ quantity: "32.5", amount: "₦406,250.00" });
    expect(view.subtotal).toBe("₦1,726,248.50");
    expect(view.discount).toEqual({ label: "Discount (10%)", amount: "−₦172,624.85" });
    expect(view.taxes).toEqual([{ label: "VAT (7.5%)", amount: "₦116,521.77" }]);
    expect(view.total).toBe("₦1,670,145.42");
  });
});
