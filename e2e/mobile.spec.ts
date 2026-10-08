import { devices, expect, test } from "@playwright/test";
import { PNG } from "pngjs";

import { openBuilder } from "./helpers";

test.use({ ...devices["Pixel 7"], channel: process.env.PLAYWRIGHT_CHANNEL });

test.describe("mobile", () => {
  test("the preview is a modal dialog that returns focus", async ({ page }) => {
    await openBuilder(page);
    const open = page.getByRole("button", { name: "Preview", exact: true });
    await open.click();

    const dialog = page.getByRole("dialog", { name: "Invoice preview" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close preview" })).toBeFocused();
    // Everything behind the dialog (editor and header) is inert.
    for (const behind of [page.locator("main"), page.getByRole("navigation", { name: "Progress" })]) {
      expect(await behind.evaluate((el) => el.closest("[inert]") !== null)).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
  });

  test("the logo can be removed on a touch screen", async ({ page }) => {
    await openBuilder(page);
    const png = new PNG({ width: 64, height: 32 });
    png.data.fill(80);
    await page.locator('input[type="file"]').setInputFiles({
      name: "logo.png",
      mimeType: "image/png",
      buffer: PNG.sync.write(png),
    });

    const remove = page.getByRole("button", { name: "Remove logo" });
    await expect(remove).toHaveCSS("opacity", "1");
    await remove.tap();
    await expect(page.getByRole("button", { name: "Add logo" })).toBeVisible();
  });
});
