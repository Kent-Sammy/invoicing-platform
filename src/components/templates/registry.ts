import { DEFAULT_TEMPLATE_ID } from "@/lib/documents";
import type { TemplateId } from "@/types/template";

import { MinimalTemplate } from "./minimal/minimal-template";
import { PLAYFUL_PALETTE } from "./playful/artwork";
import { PlayfulTemplate } from "./playful/playful-template";
import { ProfessionalTemplate } from "./professional/professional-template";
import type { TemplateDefinition } from "./types";

/** Templates in the agreed lineup that are not built yet (decision 024/026). */
export type PlannedTemplateId = "traditional" | "editorial" | "elegant";

export interface PlannedTemplate {
  id: PlannedTemplateId;
  name: string;
  description: string;
  status: "planned";
}

export type TemplateCatalogEntry = TemplateDefinition | PlannedTemplate;

const minimal: TemplateDefinition = {
  id: "minimal",
  name: "Minimal",
  description: "Clean & timeless",
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
};

const playful: TemplateDefinition = {
  id: "playful",
  name: "Playful",
  description: "Expressive & creative",
  fonts: ["bricolage"],
  surface: {
    paper: "#fffaf2",
    ink: "#1c1a2e",
    inkMuted: "#615c74",
    rule: "#e9dfcb",
    placeholder: "#aea8ba",
  },
  // Motifs keep the fixed palette; only this accent follows the brand colour.
  defaultAccent: PLAYFUL_PALETTE.violet,
  component: PlayfulTemplate,
};

const professional: TemplateDefinition = {
  id: "professional",
  name: "Professional",
  description: "Polished & business-focused",
  fonts: ["bricolage"],
  surface: {
    paper: "#ffffff",
    ink: "#111827",
    inkMuted: "#5b6475",
    rule: "#dde2ea",
    placeholder: "#a3abb8",
  },
  // Deep slate blue when no brand colour is chosen.
  defaultAccent: "#1e3a5f",
  component: ProfessionalTemplate,
};

/**
 * The single source of truth for templates, in gallery order: every template
 * in the lineup, built or planned. Only built templates can be selected.
 */
export const TEMPLATE_CATALOG: readonly TemplateCatalogEntry[] = [
  minimal,
  playful,
  professional,
  { id: "traditional", name: "Traditional", description: "Classic & trusted", status: "planned" },
  { id: "editorial", name: "Editorial", description: "Art-directed & distinctive", status: "planned" },
  { id: "elegant", name: "Elegant", description: "Premium & refined", status: "planned" },
];

export function isAvailableTemplate(entry: TemplateCatalogEntry): entry is TemplateDefinition {
  return !("status" in entry);
}

/** Built templates by id, derived from the catalog. */
export const TEMPLATES = Object.fromEntries(
  TEMPLATE_CATALOG.filter(isAvailableTemplate).map((template) => [template.id, template]),
) as Record<TemplateId, TemplateDefinition>;

/** Falls back to the default for unknown ids (e.g. from an older saved draft). */
export function getTemplate(id: string): TemplateDefinition {
  return Object.hasOwn(TEMPLATES, id)
    ? TEMPLATES[id as TemplateId]
    : TEMPLATES[DEFAULT_TEMPLATE_ID];
}
