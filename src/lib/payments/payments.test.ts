import { describe, expect, it } from "vitest";

import { createQrCode } from "./qr";
import { displayPaymentUrl, normalizePaymentUrl } from "./url";

describe("normalizePaymentUrl", () => {
  it("accepts full http(s) URLs", () => {
    expect(normalizePaymentUrl("https://paystack.com/pay/example")).toBe(
      "https://paystack.com/pay/example",
    );
    expect(normalizePaymentUrl("  http://pay.example.ng/inv?id=7 ")).toBe(
      "http://pay.example.ng/inv?id=7",
    );
  });

  it("adds https:// when the scheme is missing", () => {
    expect(normalizePaymentUrl("flutterwave.com/pay/kent")).toBe("https://flutterwave.com/pay/kent");
  });

  it("rejects unsafe schemes", () => {
    expect(normalizePaymentUrl("javascript:alert(1)")).toBeNull();
    expect(normalizePaymentUrl("data:text/html,hi")).toBeNull();
    expect(normalizePaymentUrl("ftp://files.example.com")).toBeNull();
  });

  it("rejects things that are not links", () => {
    expect(normalizePaymentUrl("")).toBeNull();
    expect(normalizePaymentUrl("pay me")).toBeNull();
    expect(normalizePaymentUrl("paystack")).toBeNull();
  });
});

describe("displayPaymentUrl", () => {
  it("shows host and path without the scheme", () => {
    expect(displayPaymentUrl("https://www.paystack.com/pay/example")).toBe("paystack.com/pay/example");
    expect(displayPaymentUrl("https://pay.example.com/")).toBe("pay.example.com");
  });

  it("truncates long links", () => {
    const shown = displayPaymentUrl(`https://pay.example.com/${"a".repeat(80)}`, 30);
    expect(shown).toHaveLength(30);
    expect(shown.endsWith("…")).toBe(true);
  });
});

describe("createQrCode", () => {
  it("encodes a URL as a square module grid with a quiet zone", () => {
    const qr = createQrCode("https://paystack.com/pay/example");
    // Version 3 (29 modules) at medium error correction, plus a 2-module border each side.
    expect(qr.size).toBe(33);
    expect(qr.path.startsWith("M")).toBe(true);
    // Finder pattern: the top-left corner module just inside the quiet zone is dark.
    expect(qr.path).toContain("M2 2h1v1h-1z");
    // The quiet zone itself stays light.
    expect(qr.path).not.toContain("M0 0h1v1h-1z");
  });

  it("is deterministic", () => {
    expect(createQrCode("https://a.co/x")).toEqual(createQrCode("https://a.co/x"));
  });
});
