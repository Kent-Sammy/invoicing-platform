"use client";

import { ArrowRight } from "lucide-react";

import { useDocument } from "@/components/document/document-provider";
import { getTemplate } from "@/components/templates/registry";
import { Button } from "@/components/ui/button";

import { TemplateGrid } from "./template-gallery";

/** Stage 1: a beautiful starting point. The only dedicated selection screen. */
export function TemplateStage({ onContinue }: { onContinue: () => void }) {
  const { document } = useDocument();
  const template = getTemplate(document.branding.templateId);

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto print:hidden">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-10 sm:px-6 sm:pt-14">
          <h1 id="template-stage-title" className="text-[22px] font-semibold tracking-tight sm:text-[26px]">
            How should your invoice look?
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">Choose a template. You can change it anytime.</p>
          <TemplateGrid
            labelledBy="template-stage-title"
            large
            className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3"
          />
        </div>
      </main>
      <div className="shrink-0 border-t bg-background print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <p className="min-w-0 truncate text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{template.name}</span>
            <span className="hidden sm:inline"> · {template.description}</span>
          </p>
          <Button onClick={onContinue}>
            Continue <ArrowRight />
          </Button>
        </div>
      </div>
    </>
  );
}
