/**
 * Quick picks for the brand colour. Mid-to-deep tones that read as accents
 * on light paper; templates still adjust any colour for contrast (theme.ts).
 */
export const BRAND_COLOR_PRESETS = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Blue", value: "#2563eb" },
  { name: "Navy", value: "#1e3a8a" },
  { name: "Teal", value: "#0f766e" },
  { name: "Green", value: "#15803d" },
  { name: "Amber", value: "#d97706" },
  { name: "Coral", value: "#e4572e" },
  { name: "Rose", value: "#be185d" },
  { name: "Plum", value: "#7e22ce" },
] as const;

/** "#a1b2c3" / "a1b2c3" → "#a1b2c3"; anything else → null. */
export function normalizeHexColor(input: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(input.trim());
  return match ? `#${match[1].toLowerCase()}` : null;
}
