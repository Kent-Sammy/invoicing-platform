"use client";

import { Check } from "lucide-react";

import { useDocument } from "@/components/document/document-provider";
import { useAsset } from "@/components/document/use-asset";
import { SafeDocumentRenderer } from "@/components/preview/safe-document-renderer";
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
        <SafeDocumentRenderer
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
  large,
  onSelect,
}: {
  entry: TemplateDefinition;
  selected: boolean;
  document: BusinessDocument;
  logo: DocumentLogo | null;
  large: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        large ? "gap-2.5 rounded-xl border p-1.5" : "gap-1.5 rounded-lg border p-1",
        selected ? "border-foreground" : "border-border hover:border-foreground/40",
      )}
    >
      <div className="rounded-[5px] bg-canvas p-[5%]">
        <Thumbnail document={document} logo={logo} entry={entry} />
      </div>
      {selected && (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-foreground text-background ring-2 ring-background",
            large ? "top-3 right-3 size-5" : "top-2 right-2 size-4",
          )}
        >
          <Check className={large ? "size-3" : "size-2.5"} strokeWidth={3} />
        </span>
      )}
      <div className={large ? "px-1.5 pb-1" : "px-1 pb-0.5"}>
        <p className={cn("truncate font-medium", large ? "text-[14px]" : "text-[13px]")}>{entry.name}</p>
        {/* Wraps rather than truncates, so every subtext stays readable. */}
        <p
          className={cn(
            "mt-px line-clamp-2 leading-snug text-balance text-muted-foreground",
            large ? "text-[12.5px]" : "text-[11.5px]",
          )}
        >
          {entry.description}
        </p>
      </div>
    </button>
  );
}

/**
 * The six templates as live cards. Selecting one changes only
 * `branding.templateId` (autosaved); content, calculations, payment details,
 * logo and brand colour are untouched.
 */
export function TemplateGrid({
  labelledBy,
  large = false,
  className,
}: {
  labelledBy: string;
  large?: boolean;
  className?: string;
}) {
  const { document, dispatch, assets } = useDocument();
  const asset = useAsset(document.branding.logo, assets);
  const logo = asset && { src: asset.dataUrl, width: asset.width, height: asset.height };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className={className}>
      {TEMPLATE_CATALOG.map((entry) => (
        <TemplateCard
          key={entry.id}
          entry={entry}
          selected={entry.id === document.branding.templateId}
          document={document}
          logo={logo}
          large={large}
          onSelect={() => dispatch({ type: "updateBranding", changes: { templateId: entry.id } })}
        />
      ))}
    </div>
  );
}

/**
 * Changing the template while creating (Appearance → Change). Takes over
 * the editor column so the live preview stays visible beside it.
 */
export function TemplateGallery({ onClose }: { onClose: () => void }) {
  return (
    <section aria-labelledby="template-gallery-title" className="@container px-5 pt-6 pb-8 print:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="template-gallery-title" className="text-[15px] font-semibold tracking-tight">
            Change template
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Only the look changes — everything you&apos;ve entered stays.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
      <TemplateGrid
        labelledBy="template-gallery-title"
        className="mt-7 grid grid-cols-2 gap-2.5 @min-[22rem]:grid-cols-3"
      />
    </section>
  );
}
