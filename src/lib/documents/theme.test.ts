import { describe, expect, it } from "vitest";

import { contrast, luminance, mix } from "@/lib/color";

import { createDocumentTheme, type DocumentSurface } from "./theme";

const white: DocumentSurface = {
  paper: "#ffffff",
  ink: "#18181b",
  inkMuted: "#71717a",
  rule: "#e4e4e7",
  placeholder: "#a1a1aa",
};
const dark: DocumentSurface = { ...white, paper: "#0d0d0f", ink: "#f4f4f5" };

describe("colour maths", () => {
  it("computes WCAG luminance and contrast", () => {
    expect(luminance("#ffffff")).toBeCloseTo(1);
    expect(luminance("#000000")).toBeCloseTo(0);
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21);
    expect(contrast("#777777", "#777777")).toBeCloseTo(1);
  });

  it("mixes colours", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mix("#123456", "#abcdef", 0)).toBe("#123456");
  });
});

describe("createDocumentTheme", () => {
  it("uses the template default accent when no brand colour is chosen", () => {
    const theme = createDocumentTheme(white, "#171717", null);
    expect(theme.brand).toBe("#171717");
    expect(theme.brandChosen).toBe(false);
  });

  it("uses the chosen brand colour", () => {
    const theme = createDocumentTheme(white, "#171717", "#4f46e5");
    expect(theme.brand).toBe("#4f46e5");
    expect(theme.brandChosen).toBe(true);
  });

  it("treats malformed colours as not chosen", () => {
    expect(createDocumentTheme(white, "#171717", "red").brandChosen).toBe(false);
  });

  it("picks readable text for brand fills", () => {
    expect(createDocumentTheme(white, "#171717", "#1e3a8a").onBrand).toBe("#ffffff");
    expect(createDocumentTheme(white, "#171717", "#ffd60a").onBrand).toBe("#111111");
  });

  it("keeps brand text readable on light paper", () => {
    const theme = createDocumentTheme(white, "#171717", "#ffd60a"); // yellow on white fails
    expect(contrast(theme.brandText, white.paper)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps brand text readable on dark paper", () => {
    const theme = createDocumentTheme(dark, "#171717", "#1e1b4b"); // navy on near-black fails
    expect(contrast(theme.brandText, dark.paper)).toBeGreaterThanOrEqual(4.5);
  });

  it("leaves already-readable brand text unchanged", () => {
    expect(createDocumentTheme(white, "#171717", "#4f46e5").brandText).toBe("#4f46e5");
  });
});
