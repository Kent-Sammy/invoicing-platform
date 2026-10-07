"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { AssetStore } from "@/lib/assets";
import { calculateTotals, type DocumentTotals } from "@/lib/calculations";
import { createDocument, documentReducer, type DocumentAction } from "@/lib/documents";
import { guestStorage } from "@/lib/guest";
import type { DocumentNumberSequence } from "@/lib/numbering";
import type { DocumentStore } from "@/lib/persistence";
import type { BusinessDocument, DocumentType } from "@/types/document";

const AUTOSAVE_DELAY_MS = 400;

export type SaveStatus = "idle" | "saved" | "error";

interface DocumentContextValue {
  document: BusinessDocument;
  /** Derived from `document` — never stored separately. */
  totals: DocumentTotals;
  dispatch: (action: DocumentAction) => void;
  /** Discards the draft (and its logo) and starts a new document with the next number. */
  reset: () => Promise<void>;
  saveStatus: SaveStatus;
  assets: AssetStore;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

// Null until the saved draft (if any) has been loaded.
function reducer(state: BusinessDocument | null, action: DocumentAction) {
  if (action.type === "replace") return action.document;
  return state && documentReducer(state, action);
}

interface DocumentProviderProps {
  children: ReactNode;
  /** Rendered while the saved draft loads. */
  fallback?: ReactNode;
  type?: DocumentType;
  store?: DocumentStore;
  assets?: AssetStore;
  numbering?: DocumentNumberSequence;
}

/**
 * Owns the one document the editor and preview share. Loads the saved draft
 * on mount (or creates a new numbered document) and autosaves every change.
 */
export function DocumentProvider({
  children,
  fallback = null,
  type = "invoice",
  store = guestStorage.documents,
  assets = guestStorage.assets,
  numbering = guestStorage.numbering,
}: DocumentProviderProps) {
  const [document, dispatch] = useReducer(reducer, null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const latest = useRef(document);

  const createNew = useCallback(
    async () => createDocument(type, { number: await numbering.next(type) }),
    [numbering, type],
  );

  // Shared across effect re-runs (e.g. StrictMode) so a new document number
  // is only ever allocated once per mount.
  const initial = useRef<Promise<BusinessDocument> | null>(null);

  useEffect(() => {
    let cancelled = false;
    initial.current ??= store
      .load()
      .catch(() => null)
      .then(async (saved) => saved ?? (await createNew()));
    initial.current.then((next) => {
      if (!cancelled) dispatch({ type: "replace", document: next });
    });
    return () => {
      cancelled = true;
    };
  }, [store, createNew]);

  useEffect(() => {
    latest.current = document;
    if (!document) return;
    const timer = setTimeout(() => {
      store.save(document).then(
        () => setSaveStatus("saved"),
        () => setSaveStatus("error"),
      );
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [document, store]);

  // Flush a pending autosave if the tab closes within the debounce window.
  useEffect(() => {
    const flush = () => {
      if (latest.current) store.save(latest.current).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [store]);

  const logo = document?.branding.logo ?? null;
  const reset = useCallback(async () => {
    if (logo) await assets.delete(logo.assetId).catch(() => {});
    await store.clear().catch(() => {});
    dispatch({ type: "replace", document: await createNew() });
  }, [logo, assets, store, createNew]);

  const totals = useMemo(() => document && calculateTotals(document), [document]);

  const value = useMemo(
    () => document && totals && { document, totals, dispatch, reset, saveStatus, assets },
    [document, totals, reset, saveStatus, assets],
  );

  if (!value) return fallback;
  return <DocumentContext value={value}>{children}</DocumentContext>;
}

export function useDocument(): DocumentContextValue {
  const context = use(DocumentContext);
  if (!context) throw new Error("useDocument must be used inside <DocumentProvider>");
  return context;
}
