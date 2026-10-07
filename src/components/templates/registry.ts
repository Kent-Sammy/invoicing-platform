import { DEFAULT_TEMPLATE_ID } from "@/lib/documents";
import type { TemplateId } from "@/types/template";

import { MinimalTemplate } from "./minimal/minimal-template";
import type { TemplateDefinition } from "./types";

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Quiet and typographic. Lets the numbers speak.",
    // The approved baseline: stays on Geist until a font migration is reviewed.
    fonts: ["geist"],
    surface: {
      paper: "#ffffff",
      ink: "#18181b",
      inkMuted: "#71717a",
      rule: "#e4e4e7",
      placeholder: "#a1a1aa",
    },
    defaultAccent: "#171717",
    component: MinimalTemplate,
  },
};

/** Falls back to the default for unknown ids (e.g. from an older saved draft). */
export function getTemplate(id: string): TemplateDefinition {
  return Object.hasOwn(TEMPLATES, id)
    ? TEMPLATES[id as TemplateId]
    : TEMPLATES[DEFAULT_TEMPLATE_ID];
}
