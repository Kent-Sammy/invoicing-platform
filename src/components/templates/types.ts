import type { ComponentType } from "react";

import type { DocumentView } from "@/lib/documents";
import type { TemplateId } from "@/types/template";

/**
 * Templates are pure renderers: they receive a fully calculated, formatted
 * view and own no state or calculations. The same output serves the live
 * preview and the printed PDF.
 */
export interface TemplateProps {
  view: DocumentView;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  component: ComponentType<TemplateProps>;
}
