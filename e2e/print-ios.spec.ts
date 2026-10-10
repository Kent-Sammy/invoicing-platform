import { expect, test, type Page } from "@playwright/test";
import jsQR from "jsqr";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { PNG } from "pngjs";

import { createSampleDocument, createStressDocument } from "../src/data/sample-document";
import { GUEST_ASSET_PREFIX } from "../src/lib/assets";
import { normalizePaymentUrl } from "../src/lib/payments";
import type { BusinessDocument } from "../src/types/document";
import { A4_PX, openBuilder, seedDraft, TEMPLATE_IDS } from "./helpers";

/*
 * iOS / iPadOS print ("flow" mode, see src/lib/print-environment.ts).
 *
 * No iOS device runs here, so each test reproduces iOS Safari's documented
 * print behaviour inside Chromium's real print-to-PDF pipeline:
 * - AirPrint margins instead of `@page { margin: 0 }` (half an inch);
 * - padding not cloned across page breaks (WebKit doesn't);
 * - A4 and US Letter paper;
 * - with and without WebKit's shrink-to-fit (layout 1.25× wider, scale 0.8).
 * Before the fix, every template printed a one-page invoice onto two pages
 * under these conditions.
 */

const CONDITIONS = [
  { name: "A4, iOS margins", paper: "A4", scale: 1 },
  { name: "US Letter, iOS margins", paper: "letter", scale: 1 },
  { name: "A4, iOS margins + shrink-to-fit", paper: "A4", scale: 0.8 },
] as const;

interface PrintedPdf {
  pages: number;
  text: string;
  /** Text runs that fall partly outside their page (clipped content). */
  outside: string[];
  links: string[];
}

async function seed(page: Page, invoice: BusinessDocument, logo = false) {
  await seedDraft(page, invoice);
  if (!logo) return;
  // A real logo asset in the guest asset store (a 120×40 grey wordmark block).
  const png = new PNG({ width: 120, height: 40 });
  png.data.fill(90);
  const asset = {
    id: "e2e-logo",
    mimeType: "image/png",
    width: 120,
    height: 40,
    byteSize: 1,
    dataUrl: `data:image/png;base64,${PNG.sync.write(png).toString("base64")}`,
    createdAt: "2026-10-10T00:00:00.000Z",
  };
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: GUEST_ASSET_PREFIX + asset.id, value: JSON.stringify(asset) },
  );
}

/** Opens the builder as iOS would print it: flow mode on, iOS print conditions applied. */
async function openAsIos(page: Page) {
  await openBuilder(page);
  await page.evaluate(() => document.documentElement.setAttribute("data-print-flow", ""));
  await page.addStyleTag({
    content: ".document-page { box-decoration-break: slice !important; -webkit-box-decoration-break: slice !important }",
  });
  await page.evaluate(() => document.fonts.ready);
}

async function printAsIos(page: Page, paper: string, scale: number): Promise<PrintedPdf> {
  await page.addStyleTag({ content: `@page { size: ${paper}; margin: 12.7mm }` });
  const data = new Uint8Array(await page.pdf({ preferCSSPageSize: true, printBackground: true, scale }));
  const pdf = await getDocument({ data }).promise;
  let text = "";
  const outside: string[] = [];
  const links: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const pdfPage = await pdf.getPage(n);
    const [, , width, height] = pdfPage.view;
    for (const item of (await pdfPage.getTextContent()).items) {
      if (!("str" in item) || !item.str.trim()) continue;
      text += item.str + " ";
      const [x, y] = [item.transform[4], item.transform[5]];
      if (x < 0 || y < 0 || x + item.width > width + 0.5 || y > height) outside.push(item.str);
    }
    for (const annotation of await pdfPage.getAnnotations()) if (annotation.url) links.push(annotation.url);
  }
  return { pages: pdf.numPages, text: text.replace(/\s+/g, ""), outside, links };
}

const squash = (value: string) => value.replace(/\s+/g, "");

for (const templateId of TEMPLATE_IDS) {
  test.describe(`${templateId}: iOS / iPadOS print`, () => {
    for (const condition of CONDITIONS) {
      test(`one-page invoices stay on one page — ${condition.name}`, async ({ page }) => {
        const invoice = createSampleDocument();
        invoice.branding.templateId = templateId;
        await seed(page, invoice, true);
        await openAsIos(page);
        const pdf = await printAsIos(page, condition.paper, condition.scale);

        expect(pdf.pages).toBe(1);
        expect(pdf.outside).toEqual([]);
        expect(pdf.text).toContain(squash("Harbour & Co."));
        // The Pay button is still a live link in the PDF.
        expect(pdf.links).toContain(normalizePaymentUrl(invoice.paymentOptions.paymentLink.url));
      });
    }

    test("a one-page invoice without payment details or notes stays on one page", async ({ page }) => {
      const invoice = createSampleDocument();
      invoice.branding.templateId = templateId;
      invoice.paymentOptions.bankTransfer.enabled = false;
      invoice.paymentOptions.paymentLink.enabled = false;
      invoice.notes = "";
      invoice.terms = "";
      await seed(page, invoice);
      await openAsIos(page);
      expect((await printAsIos(page, "letter", 1)).pages).toBe(1);
    });

    test("long invoices paginate without clipping or losing content", async ({ page }) => {
      const invoice = createSampleDocument({ repeat: 12 });
      invoice.branding.templateId = templateId;
      await seed(page, invoice, true);
      await openAsIos(page);
      const pdf = await printAsIos(page, "A4", 1);

      expect(pdf.pages).toBeGreaterThan(1);
      expect(pdf.outside).toEqual([]);
      // Every line item printed exactly once, and the total and payment section are there.
      expect(pdf.text.match(/Stockphotographylicence/gi)?.length).toBe(12);
      expect(pdf.text).toContain(squash("Payment due within 14 days."));
    });

    test("worst-case content stays inside the printable area", async ({ page }) => {
      const invoice = createStressDocument();
      invoice.branding.templateId = templateId;
      await seed(page, invoice);
      await openAsIos(page);
      const pdf = await printAsIos(page, "letter", 1);
      expect(pdf.outside).toEqual([]);
    });

    test("@layout the design is scaled as one piece, never re-flowed", async ({ page }) => {
      const invoice = createSampleDocument();
      invoice.branding.templateId = templateId;
      await seed(page, invoice, true);
      await openBuilder(page);
      await page.emulateMedia({ media: "print" });

      // Positions of key content and artwork, as fractions of the sheet.
      const geometry = () =>
        page.evaluate(() => {
          const sheet = document.querySelector<HTMLElement>("[data-print-root] .document-page")!;
          const box = sheet.getBoundingClientRect();
          const pick = (selector: string) => {
            const el = sheet.querySelector<HTMLElement>(selector);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return [r.left, r.top, r.width].map((v, i) => +((v - (i === 0 ? box.left : i === 1 ? box.top : 0)) / box.width).toFixed(3));
          };
          return {
            heading: pick("h1"),
            table: pick("table"),
            qr: pick("svg[role=img]"),
            art: pick("svg[aria-hidden]"),
            logo: pick("img"),
          };
        });

      // The desktop print layout: the A4 sheet at its designed width.
      await page.setViewportSize(A4_PX);
      const desktop = await geometry();

      // iOS lays out wider than the paper, or narrower when margins apply.
      await page.evaluate(() => document.documentElement.setAttribute("data-print-flow", ""));
      for (const width of [Math.round(A4_PX.width * 1.25), Math.round(A4_PX.width * 0.88)]) {
        await page.setViewportSize({ width, height: A4_PX.height });
        const ios = await geometry();
        for (const [name, before] of Object.entries(desktop)) {
          const after = ios[name as keyof typeof ios];
          expect(after === null, `${name} present in both`).toBe(before === null);
          if (!before || !after) continue;
          // Horizontal position and size: identical (within zoom rounding) — no re-flow.
          expect(Math.abs(after[0] - before[0]), `${name} left @${width}px`).toBeLessThan(0.006);
          expect(Math.abs(after[2] - before[2]), `${name} width @${width}px`).toBeLessThan(0.006);
          // Vertical position: identical above the flexible gap. Blocks pinned to the
          // foot of page one (payment/QR) follow the content instead — by design.
          if (name !== "qr") expect(Math.abs(after[1] - before[1]), `${name} top @${width}px`).toBeLessThan(0.006);
        }
      }
    });

    test("the QR code still scans in the iOS print layout", async ({ page }) => {
      const invoice = createSampleDocument();
      invoice.branding.templateId = templateId;
      await seed(page, invoice);
      await openBuilder(page);
      await page.evaluate(() => document.documentElement.setAttribute("data-print-flow", ""));
      await page.setViewportSize(A4_PX);
      await page.emulateMedia({ media: "print" });
      const png = PNG.sync.read(await page.locator("[data-print-root] svg[role=img]").screenshot({ scale: "device" }));
      const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
      expect(decoded?.data).toBe(normalizePaymentUrl(invoice.paymentOptions.paymentLink.url));
    });
  });
}

test("@layout desktop browsers keep the desktop print frame (flow mode stays off)", async ({ page }) => {
  await openBuilder(page);
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-print-flow"))).toBe(false);
});
