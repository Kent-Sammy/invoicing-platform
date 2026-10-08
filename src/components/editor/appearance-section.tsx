"use client";

import type { ReactNode } from "react";

import { useDocument } from "@/components/document/document-provider";
import { getTemplate } from "@/components/templates/registry";
import { Button } from "@/components/ui/button";

import { BrandColorPicker, brandColorName } from "./brand-color-picker";
import { EditorSection } from "./editor-section";

function AppearanceRow({ label, value, action }: { label: string; value: ReactNode; action: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[13px]">{value}</div>
      </div>
      {action}
    </div>
  );
}

/**
 * How the invoice looks: template and brand colour. Optional — every
 * template has an intentional default — and purely presentational: changing
 * either never touches the invoice's content.
 */
export function AppearanceSection({ onChooseTemplate }: { onChooseTemplate: () => void }) {
  const { document } = useDocument();
  const { templateId, brandColor } = document.branding;
  const template = getTemplate(templateId);

  return (
    <EditorSection title="Appearance">
      <div id="appearance" className="space-y-3">
        <AppearanceRow
          label="Template"
          value={
            <p className="truncate">
              <span className="font-medium">{template.name}</span>
              <span className="text-muted-foreground"> · {template.description}</span>
            </p>
          }
          action={
            <Button variant="outline" size="xs" onClick={onChooseTemplate} aria-label="Change template">
              Change
            </Button>
          }
        />
        <div className="border-t border-border/60" />
        <AppearanceRow
          label="Brand colour"
          value={
            <>
              <span
                aria-hidden
                className="size-4 shrink-0 rounded-full ring-1 ring-foreground/10 ring-inset"
                style={{ backgroundColor: brandColor ?? template.defaultAccent }}
              />
              <span className={brandColor === null ? "text-muted-foreground" : "font-medium"}>
                {brandColorName(brandColor)}
              </span>
            </>
          }
          action={
            <BrandColorPicker>
              <Button variant="outline" size="xs" aria-label="Change brand colour">
                Change
              </Button>
            </BrandColorPicker>
          }
        />
      </div>
    </EditorSection>
  );
}
