"use client";

import { Eye } from "lucide-react";
import { useCallback, useRef, useState, type CSSProperties } from "react";

import { DocumentProvider, useDocument } from "@/components/document/document-provider";
import { InvoiceEditor } from "@/components/editor/invoice-editor";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

import { BuilderHeader } from "./builder-header";
import { TemplateGallery } from "./template-gallery";
import { PreviewPane } from "./preview-pane";
import { DEFAULT_SPLIT, readSplit, SplitHandle } from "./split-handle";

/** Mobile: the running total and the way into the preview, always in reach. */
function MobilePreviewBar({ onPreview }: { onPreview: () => void }) {
  const { document, totals } = useDocument();
  return (
    <div className="flex shrink-0 items-center gap-3 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden print:hidden">
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground">Total</p>
        <p className="truncate text-[15px] font-semibold tabular-nums">
          {formatMoney(totals.total, document.currency)}
        </p>
      </div>
      <Button variant="outline" className="ml-auto" onClick={onPreview}>
        <Eye /> Preview
      </Button>
    </div>
  );
}

// Editor width on desktop: the saved share of the workspace, clamped so the
// editor never drops below 340px and the preview never below 480px (+1px divider).
const EDITOR_WIDTH = "lg:w-[clamp(340px,calc(var(--split)*100%),calc(100%-481px))]";

function Workspace() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const closePreview = useCallback(() => setPreviewOpen(false), []);
  // The template gallery takes over the editor column; the preview stays visible.
  const [galleryOpen, setGalleryOpen] = useState(false);
  // Workspace only renders in the browser (after the draft loads), so storage is available.
  const [split, setSplit] = useState(readSplit);
  const splitRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-dvh flex-col print:block print:h-auto">
      <BuilderHeader />
      <div
        ref={splitRef}
        className="flex min-h-0 flex-1 print:block"
        style={{ "--split": split } as CSSProperties}
      >
        <main className={`w-full overflow-y-auto lg:shrink-0 ${EDITOR_WIDTH} print:hidden`}>
          <div className="mx-auto max-w-xl pb-8 lg:max-w-none">
            {galleryOpen ? (
              <TemplateGallery onClose={() => setGalleryOpen(false)} />
            ) : (
              <InvoiceEditor onChooseTemplate={() => setGalleryOpen(true)} />
            )}
          </div>
        </main>
        <SplitHandle containerRef={splitRef} split={split} onSplitChange={setSplit} />
        <PreviewPane open={previewOpen} onClose={closePreview} />
      </div>
      <MobilePreviewBar onPreview={() => setPreviewOpen(true)} />
    </div>
  );
}

function BuilderSkeleton() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true">
      <div className="h-12 shrink-0 border-b" />
      <div className="flex flex-1" style={{ "--split": DEFAULT_SPLIT } as CSSProperties}>
        <div className={`w-full lg:border-r ${EDITOR_WIDTH}`} />
        <div className="hidden flex-1 bg-canvas lg:block" />
      </div>
    </div>
  );
}

/** The guest invoice builder: editor and live preview over one shared document. */
export function InvoiceBuilder() {
  return (
    <DocumentProvider fallback={<BuilderSkeleton />}>
      <Workspace />
    </DocumentProvider>
  );
}
