import { expect, test } from "@playwright/test";

import { fillMinimum, openBuilder, pdfContains, printToPdf, reviewInvoice, stubPrint } from "./helpers";

const isDark = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.classList.contains("dark"));

test.describe("light and dark mode", () => {
  test("follows the device, set before the first paint", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    // Checked at DOMContentLoaded, before React hydrates: no light flash.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await isDark(page)).toBe(true);

    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await isDark(page)).toBe(false);
  });

  test("the toggle switches, is remembered, and carries into the builder", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const toggle = page.getByRole("switch", { name: "Dark mode" });
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();
    await expect.poll(() => isDark(page)).toBe(true);
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    await page.reload({ waitUntil: "domcontentloaded" });
    expect(await isDark(page)).toBe(true);

    await openBuilder(page);
    expect(await isDark(page)).toBe(true);
    await page.getByRole("switch", { name: "Dark mode" }).click();
    await expect.poll(() => isDark(page)).toBe(false);
  });

  test("invoices keep their template's paper in dark mode, on screen and in print", async ({ page }) => {
    await stubPrint(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await openBuilder(page);
    expect(await isDark(page)).toBe(true);

    const paper = () =>
      page
        .getByRole("region", { name: "Invoice preview" })
        .locator(".document-page")
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await paper()).toBe("rgb(255, 255, 255)"); // Minimal's white paper

    await fillMinimum(page);
    await reviewInvoice(page);
    const pdf = await printToPdf(page);
    expect(pdfContains(pdf, "Harbour & Co.")).toBe(true);
  });
});
