import { expect, test } from "@playwright/test";

import { createSampleDocument } from "../src/data/sample-document";
import { openBuilder, seedDraft } from "./helpers";

test.describe("error states", () => {
  test("an amount too large for a line is refused, not crashed on", async ({ page }) => {
    await openBuilder(page);
    await page.getByLabel("Item 1 quantity").fill("1000");
    await page.getByLabel("Item 1 price").fill("9999999999999");

    await expect(page.getByRole("alert").filter({ hasText: "Line amount can be at most" })).toBeVisible();
    await expect(page.getByLabel("Item 1 price")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("region", { name: "Invoice preview" })).toBeVisible();
  });

  test("a saved draft that cannot be calculated is discarded", async ({ page }) => {
    const document = createSampleDocument();
    document.items[0] = { ...document.items[0], quantity: 1_000_000, unitPrice: 9_000_000_000_000_000 };
    await seedDraft(page, document);
    await openBuilder(page);
    await expect(page.locator("#business-name")).toHaveValue("");
  });

  test("blocked browser storage still opens a working builder", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
    await openBuilder(page);
    await page.locator("#business-name").fill("Studio Adebayo Ltd");
    await expect(page.getByText("Not saved in this browser")).toBeVisible();
    await expect(page.getByRole("region", { name: "Invoice preview" })).toContainText("Studio Adebayo Ltd");
  });

  test("a full storage quota shows a failed save", async ({ page }) => {
    await openBuilder(page);
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      };
    });
    await page.locator("#business-name").fill("Studio Adebayo Ltd");
    await expect(page.getByText("Not saved", { exact: true })).toBeVisible();
  });
});
