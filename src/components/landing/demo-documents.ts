import { createSampleDocument } from "@/data/sample-document";
import type { BusinessDocument } from "@/types/document";
import type { TemplateId } from "@/types/template";

/**
 * Demo content for the landing page, built from the app's own sample
 * document. Brand colour is left unset so every template shows its own
 * designed default — the page's colour comes only from the templates.
 */
export function showcaseDocument(templateId: TemplateId = "minimal"): BusinessDocument {
  const sample = createSampleDocument();
  return { ...sample, branding: { templateId, brandColor: null, logo: null } };
}

/** The hero starts with the business filled in; the script does the rest. */
export function heroStartDocument(): BusinessDocument {
  const sample = showcaseDocument("elegant");
  return {
    ...sample,
    id: "hero",
    client: { name: "", email: "", phone: "", address: "", taxId: "" },
    items: [{ id: "hero-0", description: "", quantity: 1, unitPrice: 0 }],
    discount: null,
    tax: { ...sample.tax, enabled: false },
    terms: "",
  };
}

/** The finished hero invoice — shown at once when motion is reduced. */
export function heroEndDocument(): BusinessDocument {
  const start = heroStartDocument();
  return {
    ...start,
    client: { ...start.client, name: "Harbour & Co.", email: "accounts@harbour.co" },
    items: HERO_ITEMS.map((item, index) => ({ id: `hero-${index}`, ...item })),
    tax: { ...start.tax, enabled: true },
  };
}

export const HERO_ITEMS = [
  { description: "Brand identity design", quantity: 1, unitPrice: 75_000_000 },
  { description: "Website design — 6 pages", quantity: 6, unitPrice: 8_500_000 },
] as const;

/** The live demo starts complete, ready to be edited. */
export function liveDemoDocument(): BusinessDocument {
  const sample = showcaseDocument("minimal");
  return {
    ...sample,
    id: "live",
    items: sample.items.slice(0, 2).map((item, index) => ({ ...item, id: `live-${index}` })),
    discount: null,
  };
}
