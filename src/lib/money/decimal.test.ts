import { describe, expect, it } from "vitest";

import { divideRounded, parseDecimal, toSafeInteger, toScaled } from "./decimal";

describe("parseDecimal", () => {
  it("scales a decimal string to an integer", () => {
    expect(parseDecimal("12.34", 2)).toBe(1234n);
    expect(parseDecimal("12", 2)).toBe(1200n);
    expect(parseDecimal(".5", 2)).toBe(50n);
    expect(parseDecimal("5.", 2)).toBe(500n);
  });

  it("rounds extra decimal places half away from zero", () => {
    expect(parseDecimal("12.345", 2)).toBe(1235n);
    expect(parseDecimal("12.344", 2)).toBe(1234n);
    expect(parseDecimal("-12.345", 2)).toBe(-1235n);
  });

  it("ignores thousands separators and spaces", () => {
    expect(parseDecimal("1,250,000.50", 2)).toBe(125_000_050n);
    expect(parseDecimal(" 1 250 ", 2)).toBe(125_000n);
  });

  it("rejects input that is not a number", () => {
    expect(parseDecimal("", 2)).toBeNull();
    expect(parseDecimal("abc", 2)).toBeNull();
    expect(parseDecimal("1.2.3", 2)).toBeNull();
    expect(parseDecimal("-", 2)).toBeNull();
  });
});

describe("toScaled", () => {
  it("avoids binary floating-point artefacts", () => {
    // 1.005 * 100 === 100.49999999999999 in floating point.
    expect(toScaled(1.005, 2)).toBe(101n);
    expect(toScaled(0.1 + 0.2, 2)).toBe(30n);
  });

  it("rejects non-finite numbers", () => {
    expect(() => toScaled(Number.NaN, 2)).toThrow(RangeError);
    expect(() => toScaled(Infinity, 2)).toThrow(RangeError);
  });
});

describe("divideRounded", () => {
  it("rounds half away from zero", () => {
    expect(divideRounded(5n, 2n)).toBe(3n);
    expect(divideRounded(-5n, 2n)).toBe(-3n);
    expect(divideRounded(7n, -2n)).toBe(-4n);
  });

  it("rounds to the nearest integer otherwise", () => {
    expect(divideRounded(4n, 3n)).toBe(1n);
    expect(divideRounded(5n, 3n)).toBe(2n);
  });

  it("rejects division by zero", () => {
    expect(() => divideRounded(1n, 0n)).toThrow(RangeError);
  });
});

describe("toSafeInteger", () => {
  it("refuses values that would lose precision", () => {
    expect(toSafeInteger(42n)).toBe(42);
    expect(() => toSafeInteger(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toThrow(RangeError);
  });
});
