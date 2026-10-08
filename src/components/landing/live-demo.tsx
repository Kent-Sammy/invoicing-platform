"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { useDocument } from "@/components/document/document-provider";
import { ClientSection } from "@/components/editor/client-section";
import { FieldIdScope } from "@/components/editor/editor-section";
import { ItemsSection } from "@/components/editor/items-section";
import { SafeDocumentRenderer } from "@/components/preview/safe-document-renderer";
import { A4_SIZE, ScaledDocument } from "@/components/preview/scaled-document";

import { DemoDocumentProvider } from "./demo-provider";
import { liveDemoDocument } from "./demo-documents";

function LiveDemoInner() {
  const { document, dispatch } = useDocument();

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[440px_minmax(0,1fr)] lg:gap-10">
      <div className="overflow-hidden rounded-[14px] bg-background font-sans text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_24px_48px_-32px_rgba(0,0,0,0.3)]">
        {/* The builder's own sections; ids prefixed so they never clash with the hero's. */}
        <FieldIdScope prefix="live-">
          <ClientSection />
          <ItemsSection />
        </FieldIdScope>
        <div className="flex items-center justify-between gap-3 border-t px-6 py-3 text-[12px] text-muted-foreground">
          <span>Try it — nothing you type here is saved.</span>
          <button
            type="button"
            onClick={() => dispatch({ type: "replace", document: liveDemoDocument() })}
            className="flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
      </div>
      <div className="rounded-[14px] bg-page-canvas p-4 sm:p-8 lg:sticky lg:top-8">
        <div className="mx-auto max-w-[560px] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_24px_48px_-28px_rgba(0,0,0,0.35)]">
          <ScaledDocument reserve={A4_SIZE}>
            <SafeDocumentRenderer document={document} showPlaceholders printable={false} />
          </ScaledDocument>
        </div>
      </div>
    </div>
  );
}

/**
 * The live preview, for real: the builder's Client and Items sections beside
 * the invoice they edit. Runs in memory, apart from the visitor's own draft.
 */
export function LiveDemo() {
  const [document] = useState(liveDemoDocument);
  return (
    <DemoDocumentProvider document={document}>
      <LiveDemoInner />
    </DemoDocumentProvider>
  );
}
