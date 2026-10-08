"use client";

import { useState, type ReactNode } from "react";

import { DocumentProvider } from "@/components/document/document-provider";
import { createLocalStorageAssetStore } from "@/lib/assets";
import { createMemoryStorage } from "@/lib/storage";
import type { BusinessDocument } from "@/types/document";

/**
 * The real DocumentProvider — same reducer, calculations and limits as the
 * builder — backed by in-memory stores. Landing-page demos never read or
 * write the visitor's own draft or business profile, and keep nothing.
 */
export function DemoDocumentProvider({
  document,
  fallback,
  children,
}: {
  /** The starting document, or a function choosing it when the demo mounts. */
  document: BusinessDocument | (() => BusinessDocument);
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const [stores] = useState(() => ({
    store: {
      load: async () => (typeof document === "function" ? document() : document),
      save: async () => {},
      clear: async () => {},
    },
    profiles: { load: async () => null, save: async () => {} },
    assets: createLocalStorageAssetStore("demo:", () => createMemoryStorage()),
    numbering: { next: async () => "INV-0042" },
  }));

  return (
    // Fixed content renders at once (and on the server): no placeholder, no shift.
    <DocumentProvider
      fallback={fallback}
      initialDocument={typeof document === "function" ? undefined : document}
      {...stores}
    >
      {children}
    </DocumentProvider>
  );
}
