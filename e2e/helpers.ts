import { expect, type Page } from "@playwright/test";
// The legacy build runs in Node without a DOM.
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import { GUEST_DRAFT_KEY, SCHEMA_VERSION } from "../src/lib/persistence";
import type { BusinessDocument } from "../src/types/document";
import type { TemplateId } from "../src/types/template";

export const TEMPLATE_IDS: TemplateId[] = [
  "minimal",
  "playful",
  "professional",
  "traditional",
  "editorial",
  "elegant",
];

export const TEMPLATE_NAMES: Record<TemplateId, string> = {
  minimal: "Minimal",
  playful: "Playful",
  professional: "Professional",
  traditional: "Traditional",
  editorial: "Editorial",
  elegant: "Elegant",
};

/** A4 at 96 CSS px per inch — the width print layout uses. */
export const A4_PX = { width: Math.round((210 / 25.4) * 96), height: Math.round((297 / 25.4) * 96) };

/** Starts the page with this draft saved (only on the first load). */
export async function seedDraft(page: Page, document: BusinessDocument) {
  const value = JSON.stringify({ version: SCHEMA_VERSION, savedAt: new Date().toISOString(), document });
  await page.addInitScript(
    ({ key, value }) => {
      if (sessionStorage.getItem("e2e-seeded")) return;
      localStorage.setItem(key, value);
      sessionStorage.setItem("e2e-seeded", "1");
    },
    { key: GUEST_DRAFT_KEY, value },
  );
}

/** Replaces window.print with a counter, so tests can see it was called. */
export async function stubPrint(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __prints: number };
    w.__prints = 0;
    window.print = () => {
      w.__prints++;
    };
  });
}

export async function printCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __prints: number }).__prints);
}

/** Opens the builder's Create stage and waits for the draft to load. */
export async function openBuilder(page: Page) {
  await page.goto("/create?step=create");
  await expect(page.locator("#business-name")).toBeVisible();
}

/** Fills the minimum a meaningful invoice needs. */
export async function fillMinimum(page: Page, { business = "Studio Adebayo Ltd", client = "Harbour & Co." } = {}) {
  await page.locator("#business-name").fill(business);
  await page.locator("#client-name").fill(client);
  await page.getByLabel("Item 1 description").fill("Consulting");
  await page.getByLabel("Item 1 price").fill("1000");
}

/** Create → Ready. */
export async function reviewInvoice(page: Page) {
  await page.getByRole("button", { name: /Review invoice/ }).click();
  await expect(page.getByRole("heading", { name: "Your invoice is ready" })).toBeVisible();
}

/**
 * Compares printed text the way a reader would: PDF text runs are split
 * unpredictably ("₦ 1,000.00") and templates may set text in capitals.
 */
export function pdfContains(pdf: PdfSummary, expected: string): boolean {
  const squash = (text: string) => text.replace(/\s+/g, "").toLowerCase();
  return squash(pdf.text).includes(squash(expected));
}

export interface PdfSummary {
  pages: number;
  /** Page size in points (A4 ≈ 595 × 842). */
  width: number;
  height: number;
  text: string;
}

/** Prints the current page to PDF (Chromium) and extracts its text. */
export async function printToPdf(page: Page): Promise<PdfSummary> {
  await page.evaluate(() => document.fonts.ready);
  const buffer = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  const pdf = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  let text = "";
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
  }
  const [, , width, height] = (await pdf.getPage(1)).view;
  return { pages: pdf.numPages, width, height, text: text.replace(/\s+/g, " ") };
}

/**
 * With print CSS applied at A4 width, how far (in mm) the furthest piece of
 * content reaches past the right margin of the printed sheet. ≤ 0 is good.
 */
export async function printOverflowMm(page: Page): Promise<{ overflow: number; element: string }> {
  await page.setViewportSize(A4_PX);
  await page.emulateMedia({ media: "print" });
  return page.evaluate(() => {
    const sheet = document.querySelector<HTMLElement>("[data-print-root] .document-page");
    // An invisible sheet would measure as "no overflow": that must fail too.
    if (!sheet || sheet.getBoundingClientRect().width === 0) throw new Error("No visible printable document");
    const mm = 96 / 25.4;
    const limit = sheet.getBoundingClientRect().left + sheet.clientWidth - 18 * mm;
    let overflow = -Infinity;
    let element = "";
    for (const el of sheet.querySelectorAll<HTMLElement>("*")) {
      if (el.closest(".document-every-page-art, [aria-hidden=true]")) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) continue;
      const past = (rect.right - limit) / mm;
      if (past > overflow) {
        overflow = past;
        element = `${el.tagName.toLowerCase()}: ${el.textContent?.slice(0, 40)}`;
      }
    }
    return { overflow, element };
  });
}

/** Text of every money value on the printed sheet that wraps onto two lines. */
export async function brokenNumbers(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const sheet = document.querySelector("[data-print-root] .document-page")!;
    const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT);
    const broken: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim() ?? "";
      if (text.length < 4 || !/^[−-]?[₦$£€]?[\d.,]+%?$/.test(text)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
      if (lines.size > 1) broken.push(text);
    }
    return broken;
  });
}
