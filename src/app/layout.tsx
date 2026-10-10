import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Newsreader } from "next/font/google";

import { THEME_SCRIPT } from "@/components/theme/theme";
import { PRINT_ENVIRONMENT_SCRIPT } from "@/lib/print-environment";
import { siteConfig } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Document fonts (decision 025). latin-ext is required: it contains ₦ (U+20A6).
// Not preloaded — they download only when a template actually uses them.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  preload: false,
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  preload: false,
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${newsreader.variable} h-full antialiased`}
      // The theme script sets the class before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Static, first-party theme bootstrap (see components/theme/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Marks iOS/iPadOS, whose print path needs the flow print mode (lib/print-environment.ts). */}
        <script dangerouslySetInnerHTML={{ __html: PRINT_ENVIRONMENT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
