import { expect, test } from "@playwright/test";
import jsQR from "jsqr";
import { PNG } from "pngjs";

import { createSampleDocument, createStressDocument } from "../src/data/sample-document";
import { normalizePaymentUrl } from "../src/lib/payments";
import {
  A4_PX,
  brokenNumbers,
  openBuilder,
  pdfContains,
  printOverflowMm,
  printToPdf,
  seedDraft,
  TEMPLATE_IDS,
} from "./helpers";

for (const templateId of TEMPLATE_IDS) {
  test.describe(`${templateId} template`, () => {
    test(`@layout long content stays inside the A4 page`, async ({ page }) => {
      const document = createStressDocument();
      document.branding.templateId = templateId;
      await seedDraft(page, document);
      await openBuilder(page);

      const { overflow, element } = await printOverflowMm(page);
      expect(overflow, `furthest element: ${element}`).toBeLessThanOrEqual(0.5);
      expect(await brokenNumbers(page)).toEqual([]);
    });

    test(`@layout multi-page invoice stays inside the A4 page`, async ({ page }) => {
      const document = createSampleDocument({ repeat: 12, taxMode: "inclusive" });
      document.branding.templateId = templateId;
      await seedDraft(page, document);
      await openBuilder(page);

      const { overflow, element } = await printOverflowMm(page);
      expect(overflow, `furthest element: ${element}`).toBeLessThanOrEqual(0.5);
    });

    test(`@layout paper colour reaches the sheet edge`, async ({ page }) => {
      const document = createSampleDocument();
      document.branding.templateId = templateId;
      await seedDraft(page, document);
      await openBuilder(page);
      await page.setViewportSize(A4_PX);
      await page.emulateMedia({ media: "print" });

      const paper = await page
        .locator("[data-print-root] .document-page")
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--doc-paper").trim());
      const png = PNG.sync.read(await page.screenshot({ clip: { x: 0, y: 0, width: 4, height: 4 } }));
      const hex = `#${[0, 1, 2].map((i) => png.data[i].toString(16).padStart(2, "0")).join("")}`;
      expect(hex).toBe(paper === "#fff" ? "#ffffff" : paper);
    });

    test(`multi-page PDF keeps every line item and the total`, async ({ page }) => {
      const document = createSampleDocument({ repeat: 12 });
      document.branding.templateId = templateId;
      await seedDraft(page, document);
      await openBuilder(page);

      const pdf = await printToPdf(page);
      expect(pdf.pages).toBeGreaterThan(1);
      expect(pdf.text.match(/Stock\s*photography\s*licence/gi)?.length).toBe(12);
      expect(pdfContains(pdf, "Payment due within 14 days.")).toBe(true);
    });

    test(`QR code scans to the payment link`, async ({ page }) => {
      const document = createSampleDocument();
      document.branding.templateId = templateId;
      await seedDraft(page, document);
      await openBuilder(page);
      await page.setViewportSize(A4_PX);
      await page.emulateMedia({ media: "print" });

      const qr = page.locator("[data-print-root] svg[role=img]");
      const png = PNG.sync.read(await qr.screenshot({ scale: "device" }));
      const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
      expect(decoded?.data).toBe(normalizePaymentUrl(document.paymentOptions.paymentLink.url));
    });
  });
}
