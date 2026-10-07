import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DocumentPageProps {
  brandColor: string;
  children: ReactNode;
  className?: string;
}

/**
 * The A4 sheet. Always paper-white regardless of the app theme; sizing and
 * print behaviour live in `src/app/document.css`.
 */
export function DocumentPage({ brandColor, children, className }: DocumentPageProps) {
  return (
    <article
      className={cn("document-page", className)}
      style={{ "--doc-brand": brandColor } as CSSProperties}
    >
      {children}
    </article>
  );
}
