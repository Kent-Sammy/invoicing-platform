"use client";

import { Check } from "lucide-react";

import { useDocument } from "@/components/document/document-provider";
import { useAsset } from "@/components/document/use-asset";
import { DocumentRenderer } from "@/components/preview/document-renderer";
import { ScaledDocument } from "@/components/preview/scaled-document";
import { TEMPLATE_CATALOG } from "@/components/templates/registry";
import type { TemplateDefinition } from "@/components/templates/types";
import { Button } from "@/components/ui/button";
import type { DocumentLogo } from "@/lib/documents";
import { cn } from "@/lib/utils";
import type { BusinessDocument } from "@/types/document";

/**
 * A live miniature of the user's own invoice in a template, rendered by the
 * real template component (sample content shown in the template's real
 * styling). Inert: not focusable, not clickable, never printed.
 */
function Thumbnail({
  document,
  logo,
  entry,
}: {
  document: BusinessDocument;
  logo: DocumentLogo | null;
  entry: TemplateDefinition;
}) {
  return (
    <div
      inert
      aria-hidden
      className="document-thumbnail pointer-events-none relative aspect-[210/297] overflow-hidden rounded-[2px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.08)]"
    >
      <ScaledDocument>
        <DocumentRenderer
          document={{ ...document, branding: { ...document.branding, templateId: entry.id } }}
          logo={logo}
          showPlaceholders
          printable={false}
        />
      </ScaledDocument>
    </div>
  );
}

function TemplateCard({
  entry,
  selected,
  document,
  logo,
  onSelect,
}: {
  entry: TemplateDefinition;
  selected: boolean;
  document: BusinessDocument;
  logo: DocumentLogo | null;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col gap-1.5 rounded-lg border p-1 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected ? "border-foreground" : "border-border hover:border-foreground/40",
      )}
    >
      <div className="rounded-[5px] bg-canvas p-[5%]">
        <Thumbnail document={document} logo={logo} entry={entry} />
      </div>
      {selected && (
        <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-foreground text-background ring-2 ring-background">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      )}
      <div className="px-1 pb-0.5">
        <p className="truncate text-[13px] font-medium">{entry.name}</p>
        {/* Wraps rather than truncates, so every subtext stays readable. */}
        <p className="mt-px line-clamp-2 text-[11.5px] leading-snug text-balance text-muted-foreground">
          {entry.description}
        </p>
      </div>
    </button>
  );
}

/**
 * Template selection. Lives in the editor column so the live preview stays
 * visible; selecting changes only `branding.templateId` (autosaved).
 */
export function TemplateGallery({ onClose }: { onClose: () => void }) {
  const { document, dispatch, assets } = useDocument();
  const asset = useAsset(document.branding.logo, assets);
  const logo = asset && { src: asset.dataUrl, width: asset.width, height: asset.height };

  return (
    <section aria-labelledby="template-gallery-title" className="@container px-5 pt-6 pb-8 print:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="template-gallery-title" className="text-[15px] font-semibold tracking-tight">
            Choose a template
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Select a style for your invoice. You can change this anytime.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
      <div
        role="radiogroup"
        aria-labelledby="template-gallery-title"
        className="mt-7 grid grid-cols-2 gap-2.5 @min-[22rem]:grid-cols-3"
      >
        {TEMPLATE_CATALOG.map((entry) => (
          <TemplateCard
            key={entry.id}
            entry={entry}
            selected={entry.id === document.branding.templateId}
            document={document}
            logo={logo}
            onSelect={() => dispatch({ type: "updateBranding", changes: { templateId: entry.id } })}
          />
        ))}
      </div>
    </section>
  );
}
