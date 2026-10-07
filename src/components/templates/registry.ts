import { DEFAULT_TEMPLATE_ID } from "@/lib/documents";
import type { TemplateId } from "@/types/template";

import { MinimalTemplate } from "./minimal/minimal-template";
import { PLAYFUL_PALETTE } from "./playful/artwork";
import { PlayfulTemplate } from "./playful/playful-template";
import { ProfessionalTemplate } from "./professional/professional-template";
import { TraditionalTemplate } from "./traditional/traditional-template";
import { EditorialTemplate } from "./editorial/editorial-template";
import { ElegantTemplate } from "./elegant/elegant-template";
import type { TemplateDefinition } from "./types";

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

const traditional: TemplateDefinition = {
  id: "traditional",
  name: "Traditional",
  description: "Classic & trusted",
  fonts: ["bricolage"],
  surface: {
    paper: "#ffffff",
    ink: "#1a1f2b",
    inkMuted: "#5a6170",
    rule: "#cdd2da",
    placeholder: "#a2a8b4",
  },
  // Restrained corporate navy when no brand colour is chosen.
  defaultAccent: "#1f2a44",
  component: TraditionalTemplate,
};

const editorial: TemplateDefinition = {
  id: "editorial",
  name: "Editorial",
  description: "Art-directed & distinctive",
  fonts: ["bricolage", "newsreader"],
  // Acid-lime colour field: the template's signature paper, used whether or
  // not a brand colour is chosen (decision 025).
  surface: {
    paper: "#d4f06b",
    ink: "#111111",
    inkMuted: "#3c4a10",
    rule: "#11111140",
    placeholder: "#6b7a2a",
  },
  defaultAccent: "#111111",
  component: EditorialTemplate,
};

const elegant: TemplateDefinition = {
  id: "elegant",
  name: "Elegant",
  description: "Premium & refined",
  fonts: ["bricolage", "newsreader"],
  // Near-black full-bleed paper with light inks.
  surface: {
    paper: "#0d0d10",
    ink: "#f2f2f3",
    inkMuted: "#9d9da6",
    rule: "#2b2b31",
    placeholder: "#62626b",
  },
  // Warm white pay button when no brand colour is chosen; the header light
  // band uses the template's own blue/ember glow in that case.
  defaultAccent: "#ece8e1",
  component: ElegantTemplate,
};

/**
 * The single source of truth for templates, in gallery order.
 */
export const TEMPLATE_CATALOG: readonly TemplateDefinition[] = [
  minimal,
  playful,
  professional,
  traditional,
  editorial,
  elegant,
];

/** Templates by id, derived from the catalog. */
export const TEMPLATES = Object.fromEntries(
  TEMPLATE_CATALOG.map((template) => [template.id, template]),
) as Record<TemplateId, TemplateDefinition>;

/** Falls back to the default for unknown ids (e.g. from an older saved draft). */
export function getTemplate(id: string): TemplateDefinition {
  return Object.hasOwn(TEMPLATES, id)
    ? TEMPLATES[id as TemplateId]
    : TEMPLATES[DEFAULT_TEMPLATE_ID];
}
