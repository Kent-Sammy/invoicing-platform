import { expect, test } from "@playwright/test";

import {
  fillMinimum,
  openBuilder,
  pdfContains,
  printCount,
  printToPdf,
  reviewInvoice,
  stubPrint,
  TEMPLATE_IDS,
  TEMPLATE_NAMES,
} from "./helpers";

test.describe("invoice creation", () => {
  test.beforeEach(async ({ page }) => {
    await stubPrint(page);
  });

  test("Template → Create → Ready, with live totals and printing", async ({ page }) => {
    // A fresh invoice starts by choosing its look.
    await page.goto("/create");
    await expect(page.getByRole("heading", { name: "How should your invoice look?" })).toBeVisible();
    await page.getByRole("radio", { name: /Professional/ }).click();
    await page.getByRole("button", { name: /Continue/ }).click();

    // Create: Review waits for the minimum and says what's missing.
    const review = page.getByRole("button", { name: /Review invoice/ });
    await expect(review).toBeDisabled();
    await expect(page.getByText("Add your business name, a client and an item to review.")).toBeVisible();

    await page.locator("#business-name").fill("Studio Adebayo Ltd");
    await page.locator("#client-name").fill("Harbour & Co.");
    await page.locator("#client-email").fill("accounts@harbour.co");
    await page.getByLabel("Item 1 description").fill("Brand identity design");
    await page.getByLabel("Item 1 quantity").fill("2");
    await page.getByLabel("Item 1 price").fill("150,000");
    // Enter adds the next line.
    await page.getByLabel("Item 1 price").press("Enter");
    await page.getByLabel("Item 2 description").fill("Website design");
    await page.getByLabel("Item 2 price").fill("200000.50");
    await expect(page.getByLabel("Item 1 amount")).toHaveText("₦300,000.00");
    await page.getByLabel("Tax", { exact: true }).click();
    await page.locator("#tax-rate").fill("7.5");

    // The preview updates live: 500,000.50 + 7.5% VAT (37,500.04) = 537,500.54.
    await expect(page.getByRole("region", { name: "Invoice preview" })).toContainText("₦537,500.54");
    await expect(review).toBeEnabled();

    // Switching template (Appearance) changes only the look, never the content.
    for (const id of TEMPLATE_IDS) {
      await page.getByRole("button", { name: "Change template" }).click();
      await page.getByRole("radio", { name: new RegExp(TEMPLATE_NAMES[id]) }).click();
      await page.getByRole("button", { name: "Done" }).click();
      await expect(page.locator("#client-name")).toHaveValue("Harbour & Co.");

      await reviewInvoice(page);
      await expect(page.getByRole("region", { name: "Invoice" })).toContainText("₦537,500.54");
      await page.getByRole("button", { name: /Save \/ Print PDF/ }).click();
      await expect.poll(() => printCount(page)).toBeGreaterThan(0);

      const pdf = await printToPdf(page);
      expect(pdf.width).toBeCloseTo(595, -1);
      expect(pdf.height).toBeCloseTo(842, -1);
      for (const text of ["Studio Adebayo Ltd", "Harbour & Co.", "Brand identity design", "Website design", "537,500.54"]) {
        expect(pdfContains(pdf, text), `${id}: "${text}" in ${pdf.text}`).toBe(true);
      }
      expect(pdfContains(pdf, "Client Name")).toBe(false);

      await page.getByRole("button", { name: "Edit invoice" }).click();
    }
  });

  test("stages are orientation, not gates: Back and the stepper move freely", async ({ page }) => {
    await openBuilder(page);
    await fillMinimum(page);
    await reviewInvoice(page);

    await page.goBack();
    await expect(page.locator("#client-name")).toHaveValue("Harbour & Co.");
    await page.getByRole("navigation", { name: "Progress" }).getByRole("button", { name: /Template/ }).click();
    await expect(page.getByRole("heading", { name: "How should your invoice look?" })).toBeVisible();
    await page.getByRole("navigation", { name: "Progress" }).getByRole("button", { name: /Ready/ }).click();
    await expect(page.getByRole("heading", { name: "Your invoice is ready" })).toBeVisible();

    // Ready can't be reached (or reloaded into) without the minimum.
    await page.getByRole("button", { name: "Edit invoice" }).click();
    await page.locator("#client-name").fill("");
    await expect(page.getByRole("navigation", { name: "Progress" }).getByRole("button", { name: /Ready/ })).toBeDisabled();
    await page.goto("/create?step=ready");
    await expect(page.locator("#client-name")).toBeVisible();
  });

  for (const [device, width] of [
    ["phone", 375],
    ["tablet", 768],
    ["desktop", 1280],
  ] as const) {
    test(`prints the full invoice on ${device}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openBuilder(page);
      await fillMinimum(page);
      await reviewInvoice(page);

      await page.getByRole("button", { name: /Save \/ Print PDF/ }).click();
      await expect.poll(() => printCount(page)).toBe(1);

      const pdf = await printToPdf(page);
      expect(pdf.pages).toBe(1);
      for (const text of ["Studio Adebayo Ltd", "Harbour & Co.", "Consulting", "₦1,000.00"]) {
        expect(pdfContains(pdf, text), `"${text}" in ${pdf.text}`).toBe(true);
      }
    });
  }

  test("printing works from any stage, independent of what's on screen", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await openBuilder(page);
    await fillMinimum(page);
    // Still in Create, preview never opened: the print copy is complete.
    const pdf = await printToPdf(page);
    expect(pdfContains(pdf, "Harbour & Co.")).toBe(true);
  });

  test("business details carry over to the next invoice", async ({ page }) => {
    await openBuilder(page);
    await fillMinimum(page);
    const number = await page.locator("#document-number").inputValue();

    await page.getByRole("button", { name: "New invoice" }).click();
    await page.getByRole("button", { name: "Start new" }).click();

    // The next invoice starts at Template, then Create with the business kept.
    await expect(page.getByRole("heading", { name: "How should your invoice look?" })).toBeVisible();
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.locator("#client-name")).toHaveValue("");
    await expect(page.getByLabel("Item 1 description")).toHaveValue("");
    await expect(page.locator("#business-name")).toHaveValue("Studio Adebayo Ltd");
    await expect(page.locator("#document-number")).not.toHaveValue(number);

    await page.reload();
    await expect(page.locator("#business-name")).toHaveValue("Studio Adebayo Ltd");
  });

  test("after printing, a new invoice starts without a confirmation", async ({ page }) => {
    await openBuilder(page);
    await fillMinimum(page);
    await reviewInvoice(page);
    await page.getByRole("button", { name: /Save \/ Print PDF/ }).click();
    await page.getByRole("button", { name: "Start a new invoice" }).click();
    await expect(page.getByRole("heading", { name: "How should your invoice look?" })).toBeVisible();
  });

  test("Ready offers the payment link when there is one", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openBuilder(page);
    await fillMinimum(page);
    await page.getByRole("button", { name: "Add", exact: true }).first().click();
    await page.getByRole("switch", { name: "Payment link" }).click();
    await page.locator("#payment-url").fill("paystack.com/pay/studio-adebayo");
    await reviewInvoice(page);

    await page.getByRole("button", { name: "Copy payment link" }).click();
    await expect(page.getByRole("button", { name: "Payment link copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("https://paystack.com/pay/studio-adebayo");
  });

  test("brand colour lives in Appearance, updates the preview and is kept", async ({ page }) => {
    await openBuilder(page);
    await page.getByRole("button", { name: "Change brand colour" }).click();
    await page.getByRole("radio", { name: "Coral" }).click();
    await page.keyboard.press("Escape");

    const accent = () =>
      page
        .getByRole("region", { name: "Invoice preview" })
        .locator(".document-page")
        .evaluate((el) => getComputedStyle(el).getPropertyValue("--doc-brand").trim());
    await expect.poll(accent).toBe("#e4572e");

    await page.waitForTimeout(600); // autosave
    await page.reload();
    await expect.poll(accent).toBe("#e4572e");
    await expect(page.getByText("Coral")).toBeVisible();

    await page.getByRole("button", { name: "Change brand colour" }).click();
    await page.getByRole("radio", { name: /Template default/ }).click();
    await expect.poll(accent).not.toBe("#e4572e");
  });
});
