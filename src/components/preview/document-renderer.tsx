import { getTemplate } from "@/components/templates/registry";
import { createDocumentView } from "@/lib/documents";
import type { BusinessDocument } from "@/types/document";

import { DocumentPage } from "./document-page";

/**
 * document → view model → template → A4 page. The live preview and the
 * printed PDF both come from this one component.
 */
export function DocumentRenderer({ document }: { document: BusinessDocument }) {
  const view = createDocumentView(document);
  const template = getTemplate(document.branding.templateId);

  return (
    <DocumentPage brandColor={view.branding.brandColor}>
      <template.component view={view} />
    </DocumentPage>
  );
}
