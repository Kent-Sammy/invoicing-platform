import type { CSSProperties, ReactNode } from "react";

import type { DocumentFontId } from "@/components/templates/types";
import type { DocumentSurface, DocumentTheme } from "@/lib/documents";
import { cn } from "@/lib/utils";

/** CSS font stacks for each document font (variables come from the root layout). */
const FONT_STACKS: Record<DocumentFontId, string> = {
  geist: "var(--font-geist-sans), sans-serif",
  bricolage: "var(--font-bricolage), sans-serif",
  newsreader: "var(--font-newsreader), serif",
};

interface DocumentPageProps {
  surface: DocumentSurface;
  theme: DocumentTheme;
  font: DocumentFontId;
  /** Set false for miniature renders so they never affect the printed page. */
  printable?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * The A4 sheet: applies the template's paper, inks, theme colours and base
 * font as CSS variables. Sizing, the full-bleed print frame and page-break
 * rules live in `src/app/document.css`.
 */
export function DocumentPage({
  surface,
  theme,
  font,
  printable = true,
  children,
  className,
}: DocumentPageProps) {
  const style = {
    "--doc-paper": surface.paper,
    "--doc-ink": surface.ink,
    "--doc-ink-muted": surface.inkMuted,
    "--doc-rule": surface.rule,
    "--doc-placeholder": surface.placeholder,
    "--doc-brand": theme.brand,
    "--doc-on-brand": theme.onBrand,
    "--doc-brand-text": theme.brandText,
    "--doc-brand-subtle": theme.brandSubtle,
    "--doc-font": FONT_STACKS[font],
  } as CSSProperties;

  return (
    <article className={cn("document-page", className)} style={style}>
      {/* Printed pages are full-bleed (@page margin 0): the paper colour must
          cover the whole sheet, including space below the last line. */}
      {printable && <style>{`@media print{html,body{background:${surface.paper} !important}}`}</style>}
      {children}
    </article>
  );
}
