import { getTemplate } from "@/components/templates/registry";
import { createDocumentView, withPlaceholders, type DocumentLogo } from "@/lib/documents";
import type { BusinessDocument } from "@/types/document";

import { DocumentPage } from "./document-page";

interface DocumentRendererProps {
  document: BusinessDocument;
  /** The resolved logo image; the document itself only holds a reference. */
  logo?: DocumentLogo | null;
  /**
   * Fill empty fields with marked sample content (live preview). Placeholders
   * are visible on screen only — they never print.
   */
  showPlaceholders?: boolean;
}

/**
 * document → view model → template → A4 page. The live preview and the
 * printed PDF both come from this one component. Content flows across as
 * many printed pages as it needs; page breaks are handled by print CSS.
 */
export function DocumentRenderer({
  document,
  logo = null,
  showPlaceholders = false,
}: DocumentRendererProps) {
  const filled = showPlaceholders ? withPlaceholders(document) : null;
  const view = createDocumentView(filled?.document ?? document, {
    logo,
    placeholders: filled?.placeholders,
  });
  const template = getTemplate(document.branding.templateId);

  return (
    <DocumentPage brandColor={view.branding.brandColor}>
      <template.component view={view} />
    </DocumentPage>
  );
}
