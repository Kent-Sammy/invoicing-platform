import type { ComponentType } from "react";

import type { DocumentSurface, DocumentTheme, DocumentView } from "@/lib/documents";
import type { TemplateId } from "@/types/template";

/** Document font families (loaded in the root layout; see TEMPLATE_DIRECTIONS §3). */
export type DocumentFontId = "geist" | "bricolage" | "newsreader";

/**
 * Templates are pure renderers: they receive a fully calculated, formatted
 * view plus resolved theme colours, and own no state or calculations. The
 * same output serves the live preview and the printed PDF.
 */
export interface TemplateProps {
  view: DocumentView;
  theme: DocumentTheme;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  /** One line for the template picker. */
  description: string;
  /** First entry is the document's base font. */
  fonts: DocumentFontId[];
  /** Paper and neutral inks — the template owns its surface (decision 024). */
  surface: DocumentSurface;
  /** Accent used when the user hasn't chosen a brand colour (decision 025). */
  defaultAccent: string;
  /** Layout plus any template-owned artwork. */
  component: ComponentType<TemplateProps>;
}
