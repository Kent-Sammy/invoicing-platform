import { describe, expect, it } from "vitest";

import { createSampleDocument } from "@/data/sample-document";
import type { BusinessDocument } from "@/types/document";

import {
  calculateDiscount,
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
    expect(totals.taxableSubtotal).toBe(155_362_365);
    expect(totals.taxes).toEqual([
      { label: "VAT", rate: 7.5, taxableAmount: 155_362_365, amount: 11_652_177 }, // 11,652,177.375
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
      tax: { enabled: false, label: "VAT", rate: 7.5 },
    };
    const totals = calculateTotals(document);

    expect(totals.taxes).toEqual([]);
    expect(totals.taxTotal).toBe(0);
    expect(totals.total).toBe(totals.taxableSubtotal);
  });

  it("rounds each line before summing, so printed lines add up", () => {
    const totals = calculateTotals({
      items: [
        { id: "a", description: "", quantity: 0.5, unitPrice: 1 },
        { id: "b", description: "", quantity: 0.5, unitPrice: 1 },
        { id: "c", description: "", quantity: 0.5, unitPrice: 1 },
      ],
      discount: null,
      tax: { enabled: false, label: "", rate: 0 },
    });

    expect(totals.subtotal).toBe(3); // 1 + 1 + 1, not round(1.5)
  });

  it("is zero for an empty document", () => {
    const totals = calculateTotals({
      items: [],
      discount: { type: "percentage", value: 10 },
      tax: { enabled: true, label: "VAT", rate: 7.5 },
    });

    expect(totals.total).toBe(0);
    expect(totals.discount).toBe(0);
    expect(totals.taxTotal).toBe(0);
  });
});
