import { describe, expect, it } from "vitest";

import { createSampleDocument } from "@/data/sample-document";
import type { BusinessDocument } from "@/types/document";

import { createDocument } from "./create";
import { dueDateFor } from "./payment-terms";
import { documentReducer } from "./reducer";
import { createDocumentView } from "./view";

describe("createDocument", () => {
  const document = createDocument("invoice", { today: "2026-10-07" });

  it("defaults to a Nigerian business invoicing in NGN", () => {
    expect(document.business.country).toBe("NG");
    expect(document.business.locale).toBe("en-NG");
    expect(document.currency).toBe("NGN");
  });

  it("is due 14 days after the issue date", () => {
    expect(document.issueDate).toBe("2026-10-07");
    expect(document.dueDate).toBe("2026-10-21");
    expect(document.paymentTerms).toEqual({ type: "net", days: 14 });
  });

  it("suggests VAT 7.5% (exclusive) for Nigeria, but does not apply it", () => {
    expect(document.tax).toEqual({ enabled: false, label: "VAT", rate: 7.5, mode: "exclusive" });
  });

  it("uses the allocated number, or the first number by default", () => {
    expect(document.number).toBe("INV-0001");
    expect(createDocument("invoice", { number: "INV-0007" }).number).toBe("INV-0007");
  });

  it("follows the business country for currency, locale and tax", () => {
    const uk = createDocument("invoice", { country: "GB" });
    expect(uk.currency).toBe("GBP");
    expect(uk.business.locale).toBe("en-GB");
    expect(uk.tax).toMatchObject({ label: "Tax", rate: 0 });
  });

  it("starts with no payment options and no logo", () => {
    const { bankTransfer, paymentLink, qrCode } = document.paymentOptions;
    expect([bankTransfer.enabled, paymentLink.enabled, qrCode.enabled]).toEqual([false, false, false]);
    expect(document.branding.logo).toBeNull();
  });
});

describe("dueDateFor", () => {
  it("derives the due date from payment terms", () => {
    expect(dueDateFor("2026-10-07", { type: "net", days: 14 })).toBe("2026-10-21");
    expect(dueDateFor("2026-12-25", { type: "net", days: 14 })).toBe("2027-01-08");
    expect(dueDateFor("2026-10-07", { type: "on_receipt" })).toBe("2026-10-07");
  });

  it("returns null for custom terms or an invalid issue date", () => {
    expect(dueDateFor("2026-10-07", { type: "custom" })).toBeNull();
    expect(dueDateFor("", { type: "net", days: 14 })).toBeNull();
  });
});

describe("documentReducer date rules", () => {
  const document = createDocument("invoice", { today: "2026-10-07" });

  it("moves the due date with the issue date", () => {
    const next = documentReducer(document, { type: "update", changes: { issueDate: "2026-11-01" } });
    expect(next.dueDate).toBe("2026-11-15");
  });

  it("switches to custom terms when the due date is edited directly", () => {
    const next = documentReducer(document, { type: "update", changes: { dueDate: "2026-12-01" } });
    expect(next.dueDate).toBe("2026-12-01");
    expect(next.paymentTerms).toEqual({ type: "custom" });

    // A later issue-date change no longer overrides the user's due date.
    const moved = documentReducer(next, { type: "update", changes: { issueDate: "2026-11-01" } });
    expect(moved.dueDate).toBe("2026-12-01");
  });

  it("re-derives the due date when terms change", () => {
    const next = documentReducer(document, {
      type: "update",
      changes: { paymentTerms: { type: "net", days: 30 } },
    });
    expect(next.dueDate).toBe("2026-11-06");
  });

  it("keeps the due date while the issue date is being typed", () => {
    const next = documentReducer(document, { type: "update", changes: { issueDate: "" } });
    expect(next.dueDate).toBe("2026-10-21");
  });

  it("updates the locale when the business country changes", () => {
    const next = documentReducer(document, { type: "updateBusiness", changes: { country: "US" } });
    expect(next.business.locale).toBe("en-US");
  });
});

function withOptions(
  document: BusinessDocument,
  changes: Partial<BusinessDocument["paymentOptions"]>,
): BusinessDocument {
  return { ...document, paymentOptions: { ...document.paymentOptions, ...changes } };
}

describe("createDocumentView", () => {
  it("formats amounts, dates and labels for templates", () => {
    const view = createDocumentView(createSampleDocument());

    expect(view.title).toBe("Invoice");
    expect(view.issueDate).toBe("7 Oct 2026");
    expect(view.dueDate).toBe("21 Oct 2026");
    expect(view.items[2]).toMatchObject({ quantity: "32.5", amount: "₦406,250.00" });
    expect(view.summary).toEqual([
      { label: "Subtotal", amount: "₦1,726,248.50" },
      { label: "Discount (10%)", amount: "−₦172,624.85" },
      { label: "VAT (7.5%)", amount: "₦116,521.77" },
    ]);
    expect(view.total).toEqual({ label: "Total", amount: "₦1,670,145.42" });
    expect(view.taxBreakdown).toBeNull();
  });

  it("shows inclusive tax as a breakdown under the total", () => {
    const view = createDocumentView(createSampleDocument({ taxMode: "inclusive" }));

    expect(view.summary.map((row) => row.label)).toEqual(["Subtotal", "Discount (10%)"]);
    expect(view.total.amount).toBe("₦1,553,623.65");
    expect(view.taxBreakdown).toEqual({
      note: "VAT (7.5%) included",
      lines: [
        { label: "Net", amount: "₦1,445,231.30" },
        { label: "VAT", amount: "₦108,392.35" },
      ],
    });
  });

  it("formats dates with the business locale, independent of currency", () => {
    const sample = createSampleDocument();
    const usBusinessInNaira: BusinessDocument = {
      ...sample,
      business: { ...sample.business, country: "US", locale: "en-US" },
    };
    const view = createDocumentView(usBusinessInNaira);

    expect(view.issueDate).toBe("Oct 7, 2026");
    expect(view.total.amount).toBe("₦1,670,145.42");
  });

  it("includes only the bank details that were filled in", () => {
    const sample = createSampleDocument();
    const view = createDocumentView(
      withOptions(sample, {
        bankTransfer: { ...sample.paymentOptions.bankTransfer, accountName: "", instructions: "" },
      }),
    );

    expect(view.payment?.bankTransfer).toEqual({
      title: "Bank transfer",
      fields: [
        { label: "Bank", value: "GTBank" },
        { label: "Account number", value: "0123456789" },
      ],
      instructions: "",
    });
  });

  it("builds a Pay invoice link and a QR code from the payment URL", () => {
    const view = createDocumentView(createSampleDocument());

    expect(view.payment?.link).toEqual({
      url: "https://paystack.com/pay/studio-adebayo",
      label: "Pay invoice",
      display: "paystack.com/pay/studio-adebayo",
    });
    expect(view.payment?.qr?.caption).toBe("Scan to pay");
    expect(view.payment?.qr?.code.size).toBeGreaterThan(20);
  });

  it("respects the button / QR / both choice", () => {
    const sample = createSampleDocument();
    const qrOnly = createDocumentView(
      withOptions(sample, { paymentLink: { ...sample.paymentOptions.paymentLink, showButton: false } }),
    );
    const buttonOnly = createDocumentView(withOptions(sample, { qrCode: { enabled: false } }));

    expect(qrOnly.payment?.link).toBeNull();
    expect(qrOnly.payment?.qr).not.toBeNull();
    expect(buttonOnly.payment?.link).not.toBeNull();
    expect(buttonOnly.payment?.qr).toBeNull();
  });

  it("never renders an unsafe or invalid payment URL", () => {
    const sample = createSampleDocument();
    for (const url of ["javascript:alert(1)", "not a link", ""]) {
      const view = createDocumentView(
        withOptions(sample, { paymentLink: { ...sample.paymentOptions.paymentLink, url } }),
      );
      expect(view.payment?.link).toBeNull();
      expect(view.payment?.qr).toBeNull();
    }
  });

  it("omits payment entirely when no option is enabled and filled", () => {
    const sample = createSampleDocument();
    const view = createDocumentView(
      withOptions(sample, {
        bankTransfer: { ...sample.paymentOptions.bankTransfer, enabled: false },
        paymentLink: { ...sample.paymentOptions.paymentLink, enabled: false },
      }),
    );
    expect(view.payment).toBeNull();
  });

  it("passes through the resolved logo", () => {
    const logo = { src: "data:image/webp;base64,AA", width: 1200, height: 300 };
    const view = createDocumentView(createSampleDocument(), { logo });
    expect(view.branding.logo).toEqual(logo);
  });
});
