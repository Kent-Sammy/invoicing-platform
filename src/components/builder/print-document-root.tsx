"use client";

import { useDocument } from "@/components/document/document-provider";
import { useAsset } from "@/components/document/use-asset";
import { SafeDocumentRenderer } from "@/components/preview/safe-document-renderer";

/**
 * The print source: the document at real size, hidden on screen and shown
 * only when printing. It's independent of the on-screen preview, which may
 * be hidden (mobile) or scaled, so "Save / Print PDF" works from anywhere.
 */
export function PrintDocumentRoot() {
  const { document, assets } = useDocument();
  const asset = useAsset(document.branding.logo, assets);
  const logo = asset && { src: asset.dataUrl, width: asset.width, height: asset.height };

  return (
    <div className="hidden print:block" data-print-root>
      <SafeDocumentRenderer document={document} logo={logo} showPlaceholders />
    </div>
  );
}
