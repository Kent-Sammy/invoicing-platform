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

import { calculateTotals, type DocumentTotals } from "@/lib/calculations";
import { createDocument, documentReducer, type DocumentAction } from "@/lib/documents";
import { createLocalStorageDocumentStore, type DocumentStore } from "@/lib/persistence";
import type { BusinessDocument } from "@/types/document";

const AUTOSAVE_DELAY_MS = 400;

export type SaveStatus = "idle" | "saved" | "error";

interface DocumentContextValue {
  document: BusinessDocument;
  /** Derived from `document` — never stored separately. */
  totals: DocumentTotals;
  dispatch: (action: DocumentAction) => void;
  /** Discards the draft and starts a fresh document. */
  reset: () => void;
  saveStatus: SaveStatus;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

const guestStore = createLocalStorageDocumentStore();

// Null until the saved draft (if any) has been loaded.
function reducer(state: BusinessDocument | null, action: DocumentAction) {
  if (action.type === "replace") return action.document;
  return state && documentReducer(state, action);
}

interface DocumentProviderProps {
  children: ReactNode;
  /** Rendered while the saved draft loads. */
  fallback?: ReactNode;
  store?: DocumentStore;
}

/**
 * Owns the one document the editor and preview share. Loads the saved draft
 * on mount and autosaves every change through the given store.
 */
export function DocumentProvider({
  children,
  fallback = null,
  store = guestStore,
}: DocumentProviderProps) {
  const [document, dispatch] = useReducer(reducer, null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const latest = useRef(document);

  useEffect(() => {
    let cancelled = false;
    store
      .load()
      .catch(() => null)
      .then((saved) => {
        if (!cancelled) dispatch({ type: "replace", document: saved ?? createDocument() });
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

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

  const reset = useCallback(() => {
    store.clear().catch(() => {});
    dispatch({ type: "replace", document: createDocument() });
  }, [store]);

  const totals = useMemo(() => document && calculateTotals(document), [document]);

  const value = useMemo(
    () => document && totals && { document, totals, dispatch, reset, saveStatus },
    [document, totals, reset, saveStatus],
  );

  if (!value) return fallback;
  return <DocumentContext value={value}>{children}</DocumentContext>;
}

export function useDocument(): DocumentContextValue {
  const context = use(DocumentContext);
  if (!context) throw new Error("useDocument must be used inside <DocumentProvider>");
  return context;
}
