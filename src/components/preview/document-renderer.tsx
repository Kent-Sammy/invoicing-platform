import { getTemplate } from "@/components/templates/registry";
import { createDocumentView } from "@/lib/documents";
import type { BusinessDocument } from "@/types/document";

import { DocumentPage } from "./document-page";

interface DocumentRendererProps {
  document: BusinessDocument;
  /** The resolved logo image; the document itself only holds a reference. */
  logoSrc?: string | null;
}

/**
 * document → view model → template → A4 page. The live preview and the
 * printed PDF both come from this one component. Content flows across as
 * many printed pages as it needs; page breaks are handled by print CSS.
 */
export function DocumentRenderer({ document, logoSrc = null }: DocumentRendererProps) {
  const view = createDocumentView(document, { logoSrc });
  const template = getTemplate(document.branding.templateId);

  return (
    <DocumentPage brandColor={view.branding.brandColor}>
      <template.component view={view} />
    </DocumentPage>
  );
}
