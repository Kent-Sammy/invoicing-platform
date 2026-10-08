import { expect, test } from "@playwright/test";

import { GUEST_DRAFT_KEY } from "../src/lib/persistence";

test.describe("landing page", () => {
  test("hero promise and CTA lead into the builder", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Beautiful invoices. In about a minute." })).toBeVisible();
    await expect(page.getByText("Free · No sign-up · Takes about a minute")).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: /Create an invoice/ }).first().click();
    await expect(page).toHaveURL(/\/create/);
    await expect(page.getByRole("heading", { name: "How should your invoice look?" })).toBeVisible();
  });

  test("the live demo is real and never touches the visitor's own draft", async ({ page }) => {
    await page.goto("/");
    const client = page.locator("#live-client-name");
    await client.fill("Lagos Ferry Co.");
    await expect(page.locator("#live-preview .document-page")).toContainText("Lagos Ferry Co.");

    await page.waitForTimeout(600);
    expect(await page.evaluate((key) => localStorage.getItem(key), GUEST_DRAFT_KEY)).toBeNull();
    // Two editors on one page, no duplicate ids.
    const duplicates = await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect(duplicates).toEqual([]);
  });

  test("template showcase switches between the six real templates", async ({ page }) => {
    await page.goto("/");
    const panel = page.locator("#template-panel .document-page");
    await page.getByRole("tab", { name: /Editorial/ }).click();
    await expect.poll(() => panel.evaluate((el) => getComputedStyle(el).getPropertyValue("--doc-paper").trim())).toBe("#d4f06b");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("tab", { name: /Elegant/ })).toHaveAttribute("aria-selected", "true");
  });

  test("on desktop, scrolling through the showcase steps through all six templates", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const track = page.locator("#templates [class*='400vh']");
    const selected = () => page.locator("[role=tab][aria-selected=true]").getAttribute("id");
    const scrollTo = (progress: number) =>
      track.evaluate((el, p) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + p * ((el as HTMLElement).offsetHeight - window.innerHeight), behavior: "instant" });
      }, progress);

    const seen: (string | null)[] = [];
    for (const progress of [0.05, 0.25, 0.42, 0.58, 0.75, 0.95]) {
      await scrollTo(progress);
      await page.waitForTimeout(150);
      seen.push(await selected());
    }
    expect(seen).toEqual(["minimal", "playful", "professional", "traditional", "editorial", "elegant"].map((id) => `template-tab-${id}`));

    // Clicking scrolls to that template, so scroll and selection agree.
    await page.getByRole("tab", { name: /Playful/ }).click();
    await page.waitForTimeout(1300);
    expect(await selected()).toBe("template-tab-playful");
    await page.mouse.wheel(0, 10);
    await page.waitForTimeout(200);
    expect(await selected()).toBe("template-tab-playful");
  });

  test("How It Works rules run as loaders only while hovered", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const steps = page.locator(".landing-step");
    const line = (index: number) => steps.nth(index).locator(".landing-step-line");
    const animation = (index: number) => line(index).evaluate((el) => getComputedStyle(el).animationName);
    const width = (index: number) => line(index).evaluate((el) => el.getBoundingClientRect().width);

    await steps.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const full = await steps.first().evaluate((el) => el.getBoundingClientRect().width);
    expect(await width(0)).toBeCloseTo(full, 0); // a full rule at rest
    expect(await animation(0)).toBe("none");

    await steps.first().hover();
    expect(await animation(0)).toBe("landing-loader");
    expect(await animation(1)).toBe("none"); // only the hovered step
    const widths = [];
    for (let i = 0; i < 6; i++) {
      widths.push(Math.round(await width(0)));
      await page.waitForTimeout(150);
    }
    expect(new Set(widths).size).toBeGreaterThan(2); // it's moving

    await page.mouse.move(5, 5);
    expect(await animation(0)).toBe("none");
    expect(await width(0)).toBeCloseTo(full, 0); // back to the full rule
  });

  test("The Details rows draw their rule in ink on hover", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const rows = page.locator(".landing-detail");
    const inked = (index: number) =>
      rows.nth(index).locator(".landing-detail-line").evaluate((el) => el.getBoundingClientRect().width / el.parentElement!.getBoundingClientRect().width);

    await rows.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    expect(await inked(0)).toBe(0); // a quiet hairline at rest

    await rows.first().hover();
    await page.waitForTimeout(700);
    expect(await inked(0)).toBeCloseTo(1, 2); // fully drawn
    expect(await inked(1)).toBe(0); // only the hovered row

    await page.mouse.move(5, 5);
    await page.waitForTimeout(700);
    expect(await inked(0)).toBe(0);
  });

  test("footer links go somewhere real", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const footer = page.locator("footer");

    // A template link shows that template in the showcase.
    await footer.getByRole("link", { name: "Editorial" }).click();
    await expect(page.getByRole("tab", { name: /Editorial/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#template-panel")).toBeInViewport();

    // A help link opens its FAQ answer.
    await footer.getByRole("link", { name: "Saving a PDF" }).click();
    await expect(page.locator("#faq-pdf")).toHaveAttribute("open", "");
    await expect(page.locator("#faq-pdf")).toBeInViewport();

    // Every in-page link points at a section that exists.
    for (const href of await footer.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href")))) {
      expect(await page.locator(href!).count(), href!).toBe(1);
    }
    await expect(footer.getByRole("link", { name: /Create an invoice/ })).toHaveAttribute("href", "/create");

    await footer.getByRole("button", { name: "Back to top" }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("on phones, a footer template link scrolls to the showcase", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Elegant" }).click();
    await expect(page.getByRole("tab", { name: /Elegant/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#template-panel")).toBeInViewport();
  });

  test("reduced motion shows the finished hero invoice at once", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator(".hero-product .document-page").first()).toContainText("Harbour & Co.");
  });

  test("motion is quiet, and absent when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // No entrance animation, and nothing below the fold is held back.
    expect(await page.locator(".landing-enter-headline").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(
      () => [...document.querySelectorAll("[data-reveal], [data-reveal-group] > *")].filter((el) => getComputedStyle(el).opacity !== "1").length,
    );
    expect(hidden).toBe(0);
    // The How It Works rules stay still on hover.
    await page.locator(".landing-step").first().hover();
    expect(await page.locator(".landing-step-line").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    // Buttons still respond (shadow), but never move.
    const cta = page.getByRole("main").getByRole("link", { name: /Create an invoice/ }).first();
    await cta.hover();
    await page.waitForTimeout(300);
    expect(await cta.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  });

  for (const [device, width] of [
    ["desktop", 1440],
    ["phone", 375],
  ] as const) {
    test(`nothing shifts as the page loads, hydrates and reveals (${device})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const layout = () =>
        page.evaluate(() => [...document.querySelectorAll("main > section")].map((s) => Math.round((s as HTMLElement).offsetTop)));

      // First paint: server HTML and CSS only.
      await page.goto("/", { waitUntil: "commit" });
      await page.waitForSelector("main > section:last-of-type");
      const firstPaint = await layout();

      // Settled: demos loaded, sheets measured, fonts in.
      await expect(page.locator("#live-client-name")).toBeAttached();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      expect(await layout()).toEqual(firstPaint);

      // Revealing on scroll doesn't move anything either.
      await page.locator("#templates [data-reveal]").first().scrollIntoViewIfNeeded();
      await expect
        .poll(() => page.locator("#templates [data-reveal]").first().evaluate((el) => getComputedStyle(el).opacity))
        .toBe("1");
      expect(await layout()).toEqual(firstPaint);
    });
  }

  test("phones get an intentional layout with no sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByText("Type above. Watch it appear below.")).toBeVisible();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });
});
