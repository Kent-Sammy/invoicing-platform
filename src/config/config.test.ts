import { describe, expect, it } from "vitest";

import { normalizePaymentUrl } from "@/lib/payments";

import { normalizeHexColor } from "./brand-colors";
import { maxAmount } from "./limits";

describe("limits and inputs", () => {
  it("caps amounts at 999,999,999,999.99", () => {
    expect(maxAmount("NGN")).toBe(99_999_999_999_999);
  });

  it("normalises hex colours", () => {
    expect(normalizeHexColor("E4572E")).toBe("#e4572e");
    expect(normalizeHexColor(" #4F46E5 ")).toBe("#4f46e5");
    expect(normalizeHexColor("#fff")).toBeNull();
    expect(normalizeHexColor("red")).toBeNull();
  });

  it("refuses payment links too long for a QR code", () => {
    expect(normalizePaymentUrl(`https://pay.example.com/${"a".repeat(600)}`)).toBeNull();
  });
});
