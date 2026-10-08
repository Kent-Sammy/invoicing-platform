"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import { DocumentProvider, useDocument } from "@/components/document/document-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { InvoiceEditor } from "@/components/editor/invoice-editor";
import { Button } from "@/components/ui/button";
import { hasInvoiceContent, missingRequirements } from "@/lib/documents";

import { BuilderError } from "./builder-error";
import { BuilderHeader } from "./builder-header";
import { CreateFooter } from "./create-footer";
import { PreviewPane } from "./preview-pane";
import { PrintDocumentRoot } from "./print-document-root";
import { ReadyStage } from "./ready-stage";
import { DEFAULT_SPLIT, readSplit, SplitHandle } from "./split-handle";
import { TemplateGallery } from "./template-gallery";
import { TemplateStage } from "./template-stage";
import { useBuilderStage, type BuilderStage } from "./use-builder-stage";

// Editor width on desktop: the saved share of the workspace, clamped so the
// editor never drops below 340px and the preview never below 480px (+1px divider).
const EDITOR_WIDTH = "lg:w-[clamp(340px,calc(var(--split)*100%),calc(100%-481px))]";

/** Stage 2: the editor beside the live preview — creating, not form-filling. */
function CreateStage({
  onReview,
  previewOpen,
  setPreviewOpen,
}: {
  onReview: () => void;
  /** Mobile full-screen preview; owned by the shell so the header goes inert too. */
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
}) {
  const { document } = useDocument();
  const closePreview = useCallback(() => setPreviewOpen(false), [setPreviewOpen]);
  // The full-screen preview is mobile-only: close it if the window widens to
  // the side-by-side layout, so the editor is never left inert.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setPreviewOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [setPreviewOpen]);
  // Appearance → Change template takes over the editor column; the preview stays visible.
  const [galleryOpen, setGalleryOpen] = useState(false);
  const closeGallery = () => {
    setGalleryOpen(false);
    // Back to where the user was: the Appearance section.
    requestAnimationFrame(() => window.document.getElementById("appearance")?.scrollIntoView({ block: "center" }));
  };
  // CreateStage only renders in the browser (after the draft loads), so storage is available.
  const [split, setSplit] = useState(readSplit);
  const splitRef = useRef<HTMLDivElement>(null);
  const ready = missingRequirements(document).length === 0;

  return (
    <div ref={splitRef} className="flex min-h-0 flex-1" style={{ "--split": split } as CSSProperties}>
      <div inert={previewOpen} className={`flex min-h-0 w-full flex-col lg:shrink-0 ${EDITOR_WIDTH} print:hidden`}>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-xl pb-8 lg:max-w-none">
            {galleryOpen ? (
              <TemplateGallery onClose={closeGallery} />
            ) : (
              // Keyed by document: a new invoice starts with every editor section fresh.
              <InvoiceEditor key={document.id} onChooseTemplate={() => setGalleryOpen(true)} />
            )}
          </div>
        </main>
        <CreateFooter onReview={onReview} onPreview={() => setPreviewOpen(true)} />
      </div>
      <SplitHandle containerRef={splitRef} split={split} onSplitChange={setSplit} />
      <PreviewPane
        open={previewOpen}
        onClose={closePreview}
        action={
          ready && (
            <Button size="sm" onClick={onReview}>
              Review <ArrowRight />
            </Button>
          )
        }
      />
    </div>
  );
}

function Workspace() {
  const { document } = useDocument();
  const missing = missingRequirements(document).length > 0;
  const fresh = !hasInvoiceContent(document);

  // Ready needs a complete invoice; with no stage in the URL, a fresh invoice
  // starts by choosing its look and one in progress resumes in Create.
  const resolve = useCallback(
    (requested: BuilderStage | null): BuilderStage => {
      if (requested === "ready" && missing) return "create";
      return requested ?? (fresh ? "template" : "create");
    },
    [missing, fresh],
  );
  const [stage, goTo] = useBuilderStage(resolve);
  const navigate = (next: BuilderStage) => goTo(resolve(next));

  // Printing (or saving as PDF) this invoice means starting the next one needs no confirmation.
  const [exportedId, setExportedId] = useState<string | null>(null);
  const exported = exportedId === document.id;
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col print:block print:h-auto">
      <div inert={previewOpen} className="contents">
        <BuilderHeader stage={stage} onStage={navigate} exported={exported} />
      </div>
      {stage === "template" && <TemplateStage onContinue={() => navigate("create")} />}
      {stage === "create" && (
        <CreateStage
          onReview={() => {
            setPreviewOpen(false);
            navigate("ready");
          }}
          previewOpen={previewOpen}
          setPreviewOpen={setPreviewOpen}
        />
      )}
      {stage === "ready" && (
        <ReadyStage
          exported={exported}
          onEdit={() => navigate("create")}
          onNew={() => navigate("template")}
          onPrinted={() => setExportedId(document.id)}
        />
      )}
      {/* Printing works from every stage and never depends on what's on screen. */}
      <PrintDocumentRoot />
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

/**
 * The guest invoice builder: Template → Create → Ready over one shared
 * document. Stages are orientation, not gates; the document, autosave and
 * live preview are the same throughout.
 */
export function InvoiceBuilder() {
  return (
    <ErrorBoundary fallback={(retry) => <BuilderError onRetry={retry} />}>
      <DocumentProvider fallback={<BuilderSkeleton />}>
        <Workspace />
      </DocumentProvider>
    </ErrorBoundary>
  );
}
