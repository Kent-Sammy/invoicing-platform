import { Onest } from "next/font/google";

/**
 * Onest — the landing page's marketing typeface (display and text). Loaded
 * only by the landing page; the builder and the embedded product demos keep
 * the product's own fonts. latin-ext includes ₦.
 */
export const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "latin-ext"],
});
