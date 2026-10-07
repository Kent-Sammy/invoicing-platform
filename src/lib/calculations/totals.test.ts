import { describe, expect, it } from "vitest";

import { createSampleDocument } from "@/data/sample-document";
import type { BusinessDocument } from "@/types/document";

import {
  calculateDiscount,
  calculateIncludedTax,
  calculateLineTotal,
  calculateSubtotal,
  calculateTax,
  calculateTotals,
} from "./totals";

describe("calculateLineTotal", () => {
  it("multiplies quantity by unit price", () => {
    expect(calculateLineTotal({ quantity: 3, unitPrice: 1_999_950 })).toBe(5_999_850);
  });

  it("supports fractional quantities", () => {
    expect(calculateLineTotal({ quantity: 32.5, unitPrice: 1_250_000 })).toBe(40_625_000);
  });

  it("rounds to the nearest minor unit, half away from zero", () => {
    expect(calculateLineTotal({ quantity: 1.5, unitPrice: 333 })).toBe(500); // 499.5
    expect(calculateLineTotal({ quantity: 0.1, unitPrice: 15 })).toBe(2); // 1.5
    expect(calculateLineTotal({ quantity: 0.333, unitPrice: 1_000 })).toBe(333);
  });

  it("is zero for zero quantity or price", () => {
    expect(calculateLineTotal({ quantity: 0, unitPrice: 5_000 })).toBe(0);
    expect(calculateLineTotal({ quantity: 4, unitPrice: 0 })).toBe(0);
  });
});

describe("calculateSubtotal", () => {
  it("sums line totals", () => {
    expect(calculateSubtotal([100, 250, 5])).toBe(355);
    expect(calculateSubtotal([])).toBe(0);
  });
});

describe("calculateDiscount", () => {
  it("applies a percentage of the subtotal, rounded", () => {
    expect(calculateDiscount(10_000, { type: "percentage", value: 10 })).toBe(1_000);
    expect(calculateDiscount(1_005, { type: "percentage", value: 10 })).toBe(101); // 100.5
  });

  it("applies a fixed amount", () => {
    expect(calculateDiscount(10_000, { type: "fixed", amount: 2_500 })).toBe(2_500);
  });

  it("never exceeds the subtotal or goes negative", () => {
    expect(calculateDiscount(3_000, { type: "fixed", amount: 5_000 })).toBe(3_000);
    expect(calculateDiscount(3_000, { type: "percentage", value: 150 })).toBe(3_000);
    expect(calculateDiscount(3_000, { type: "fixed", amount: -500 })).toBe(0);
  });

  it("is zero with no discount or no subtotal", () => {
    expect(calculateDiscount(10_000, null)).toBe(0);
    expect(calculateDiscount(0, { type: "fixed", amount: 500 })).toBe(0);
  });
});

describe("calculateTax", () => {
  it("rounds the tax amount once, to the currency's minor unit", () => {
    expect(calculateTax(10_050, 7.5)).toBe(754); // 753.75
    expect(calculateTax(10, 7.5)).toBe(1); // 0.75
    expect(calculateTax(6, 7.5)).toBe(0); // 0.45
  });

  it("handles a zero rate", () => {
    expect(calculateTax(10_000, 0)).toBe(0);
  });
});

describe("calculateTotals", () => {
  it("calculates a full invoice: subtotal → discount → tax → total", () => {
    const totals = calculateTotals(createSampleDocument());

    expect(totals.subtotal).toBe(172_624_850);
    expect(totals.discount).toBe(17_262_485); // 10%
    expect(totals.discountedSubtotal).toBe(155_362_365);
    expect(totals.net).toBe(155_362_365);
    expect(totals.taxes).toEqual([
      { label: "VAT", rate: 7.5, mode: "exclusive", taxableAmount: 155_362_365, amount: 11_652_177 }, // 11,652,177.375
    ]);
    expect(totals.taxTotal).toBe(11_652_177);
    expect(totals.total).toBe(167_014_542);
  });

  it("keys line totals by item id", () => {
    const totals = calculateTotals(createSampleDocument());
    expect(totals.lineTotals["sample-0-2"]).toBe(40_625_000);
  });

  it("applies no tax when tax is disabled", () => {
    const document: BusinessDocument = {
      ...createSampleDocument(),
      tax: { enabled: false, label: "VAT", rate: 7.5, mode: "exclusive" },
    };
    const totals = calculateTotals(document);

    expect(totals.taxes).toEqual([]);
    expect(totals.taxTotal).toBe(0);
    expect(totals.net).toBe(totals.discountedSubtotal);
    expect(totals.total).toBe(totals.discountedSubtotal);
  });

  it("rounds each line before summing, so printed lines add up", () => {
    const totals = calculateTotals({
      items: [
        { id: "a", description: "", quantity: 0.5, unitPrice: 1 },
        { id: "b", description: "", quantity: 0.5, unitPrice: 1 },
        { id: "c", description: "", quantity: 0.5, unitPrice: 1 },
      ],
      discount: null,
      tax: { enabled: false, label: "", rate: 0, mode: "exclusive" },
    });

    expect(totals.subtotal).toBe(3); // 1 + 1 + 1, not round(1.5)
  });

  it("is zero for an empty document", () => {
    const totals = calculateTotals({
      items: [],
      discount: { type: "percentage", value: 10 },
      tax: { enabled: true, label: "VAT", rate: 7.5, mode: "exclusive" },
    });

    expect(totals.total).toBe(0);
    expect(totals.discount).toBe(0);
    expect(totals.taxTotal).toBe(0);
  });
});

describe("calculateIncludedTax", () => {
  it("extracts the tax contained in a gross amount", () => {
    expect(calculateIncludedTax(10_750_000, 7.5)).toBe(750_000); // ₦107,500 → ₦7,500
  });

  it("rounds once to the minor unit", () => {
    expect(calculateIncludedTax(100, 7.5)).toBe(7); // 6.976…
    expect(calculateIncludedTax(1, 7.5)).toBe(0); // 0.0697…
  });

  it("is zero at a zero rate", () => {
    expect(calculateIncludedTax(10_000, 0)).toBe(0);
  });
});

describe("tax modes", () => {
  const vat = (mode: "exclusive" | "inclusive") => ({
    items: [{ id: "a", description: "", quantity: 1, unitPrice: 10_750_000 }],
    discount: null,
    tax: { enabled: true, label: "VAT", rate: 7.5, mode },
  });

  it("exclusive: adds tax on top of the net price", () => {
    const totals = calculateTotals({
      ...vat("exclusive"),
      items: [{ id: "a", description: "", quantity: 1, unitPrice: 10_000_000 }],
    });

    // Net ₦100,000 + VAT ₦7,500 = ₦107,500
    expect(totals.net).toBe(10_000_000);
    expect(totals.taxTotal).toBe(750_000);
    expect(totals.total).toBe(10_750_000);
  });

  it("inclusive: extracts tax from the price, total unchanged", () => {
    const totals = calculateTotals(vat("inclusive"));

    // Total ₦107,500, of which VAT ₦7,500 and net ₦100,000
    expect(totals.total).toBe(10_750_000);
    expect(totals.taxTotal).toBe(750_000);
    expect(totals.net).toBe(10_000_000);
    expect(totals.taxes[0]).toMatchObject({ mode: "inclusive", taxableAmount: 10_000_000 });
  });

  it("inclusive: net and tax always add up to the total", () => {
    const totals = calculateTotals(createSampleDocument({ taxMode: "inclusive" }));

    expect(totals.discountedSubtotal).toBe(155_362_365);
    expect(totals.taxTotal).toBe(10_839_235); // 10,839,234.767…
    expect(totals.net).toBe(144_523_130);
    expect(totals.net + totals.taxTotal).toBe(totals.total);
    expect(totals.total).toBe(155_362_365);
  });

  it("inclusive: discounts reduce the gross amount before tax is extracted", () => {
    const totals = calculateTotals({
      ...vat("inclusive"),
      discount: { type: "fixed", amount: 750_000 },
    });

    expect(totals.discountedSubtotal).toBe(10_000_000);
    expect(totals.taxTotal).toBe(697_674); // 697,674.418…
    expect(totals.net).toBe(9_302_326);
    expect(totals.total).toBe(10_000_000);
  });
});
