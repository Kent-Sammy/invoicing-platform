"use client";

import { useDocument } from "@/components/document/document-provider";
import { getTemplate } from "@/components/templates/registry";
import { Button } from "@/components/ui/button";

/** The way into the template gallery, at the top of the editor. */
export function TemplateSection({ onChoose }: { onChoose: () => void }) {
  const { document } = useDocument();
  const template = getTemplate(document.branding.templateId);

  return (
    <section className="flex items-center justify-between gap-4 border-b border-border/60 px-6 py-4">
      <div className="min-w-0">
        <h2 className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">Template</h2>
        <p className="mt-0.5 truncate text-[13px]">
          <span className="font-medium">{template.name}</span>
          <span className="text-muted-foreground"> · {template.description}</span>
        </p>
      </div>
      <Button variant="outline" size="xs" onClick={onChoose}>
        Change
      </Button>
    </section>
  );
}
