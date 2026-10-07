"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { useDocument } from "@/components/document/document-provider";
import { useAsset } from "@/components/document/use-asset";
import { DocumentRenderer } from "@/components/preview/document-renderer";
import { ScaledDocument } from "@/components/preview/scaled-document";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DownloadButton } from "./builder-header";

interface PreviewPaneProps {
  /** Mobile only: whether the full-screen preview is open. */
  open: boolean;
  onClose: () => void;
}

/**
 * The live document on a neutral canvas. Rendered once: a side panel on
 * desktop, a full-screen view on mobile, and the print source everywhere.
 */
export function PreviewPane({ open, onClose }: PreviewPaneProps) {
  const { document, assets } = useDocument();
  const asset = useAsset(document.branding.logo, assets);
  const logo = asset && { src: asset.dataUrl, width: asset.width, height: asset.height };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <section
      aria-label="Invoice preview"
      className={cn(
        "min-w-0 flex-col bg-canvas lg:static lg:flex lg:flex-1",
        open ? "fixed inset-0 z-40 flex" : "hidden",
        "print:static print:block print:bg-transparent",
      )}
    >
      <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3 lg:hidden print:hidden">
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close preview">
          <X />
        </Button>
        <span className="text-[13px] font-medium">Preview</span>
        <DownloadButton className="ml-auto" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-12 xl:py-10 print:overflow-visible print:p-0">
        <ScaledDocument maxScale={1.25}>
          <div className="shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.18)] print:shadow-none">
            <DocumentRenderer document={document} logo={logo} showPlaceholders />
          </div>
        </ScaledDocument>
      </div>
    </section>
  );
}
