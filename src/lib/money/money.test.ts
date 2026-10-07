import { describe, expect, it } from "vitest";

import { formatMoney } from "./format";
import { parseMoney, toDecimalString } from "./money";

describe("parseMoney", () => {
  it("converts major-unit input to minor units", () => {
    expect(parseMoney("250,000", "NGN")).toBe(25_000_000);
    expect(parseMoney("100.50", "USD")).toBe(10_050);
    expect(parseMoney("0.05", "GBP")).toBe(5);
  });

  it("rounds sub-minor-unit input half away from zero", () => {
    expect(parseMoney("100.505", "USD")).toBe(10_051);
    expect(parseMoney("100.504", "USD")).toBe(10_050);
  });

  it("returns null for invalid or unsafe input", () => {
    expect(parseMoney("abc", "NGN")).toBeNull();
    expect(parseMoney("", "NGN")).toBeNull();
    expect(parseMoney("999999999999999999999", "NGN")).toBeNull();
  });
});

describe("toDecimalString", () => {
  it("renders minor units as an exact decimal", () => {
    expect(toDecimalString(10_050, "USD")).toBe("100.50");
    expect(toDecimalString(5, "USD")).toBe("0.05");
    expect(toDecimalString(0, "USD")).toBe("0.00");
    expect(toDecimalString(-5, "USD")).toBe("-0.05");
  });

  it("rejects non-integer amounts", () => {
    expect(() => toDecimalString(100.5, "USD")).toThrow(RangeError);
  });
});

describe("formatMoney", () => {
  it("formats each supported currency", () => {
    expect(formatMoney(25_000_000, "NGN")).toBe("₦250,000.00");
    expect(formatMoney(10_050, "USD")).toBe("$100.50");
    expect(formatMoney(123_456, "GBP")).toBe("£1,234.56");
    expect(formatMoney(10_050, "EUR")).toBe("€100.50");
  });

  it("formats negative amounts", () => {
    expect(formatMoney(-10_050, "USD")).toBe("-$100.50");
  });

  it("can omit the currency symbol", () => {
    expect(formatMoney(25_000_000, "NGN", { symbol: false })).toBe("250,000.00");
  });

  it("stays exact for very large amounts", () => {
    expect(formatMoney(Number.MAX_SAFE_INTEGER, "USD")).toBe("$90,071,992,547,409.91");
  });
});
