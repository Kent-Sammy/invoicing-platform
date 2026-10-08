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
import { calculateTotals, isCalculable, type DocumentTotals } from "@/lib/calculations";
import { createDocument, documentReducer, type DocumentAction } from "@/lib/documents";
import { guestStorage } from "@/lib/guest";
import type { DocumentNumberSequence } from "@/lib/numbering";
import type { DocumentStore } from "@/lib/persistence";
import { applyBusinessProfile, profileFromDocument, type BusinessProfileStore } from "@/lib/profile";
import { isStoragePersistent } from "@/lib/storage";
import type { BusinessDocument, DocumentType } from "@/types/document";

const AUTOSAVE_DELAY_MS = 400;

/**
 * idle: nothing saved yet · saved: stored in this browser · error: the last
 * save failed (e.g. storage full) · unavailable: the browser blocks storage,
 * so work lasts only for this visit.
 */
export type SaveStatus = "idle" | "saved" | "error" | "unavailable";

interface DocumentContextValue {
  document: BusinessDocument;
  /** Derived from `document` — never stored separately. */
  totals: DocumentTotals;
  dispatch: (action: DocumentAction) => void;
  /**
   * Starts the next invoice: client, items, notes and dates are cleared;
   * the business profile (identity, logo, payment details) and defaults stay.
   */
  reset: () => Promise<void>;
  saveStatus: SaveStatus;
  assets: AssetStore;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

/** The initial draft, applied only while nothing is loaded yet. */
type ProviderAction = DocumentAction | { type: "load"; document: BusinessDocument };

// Null until the saved draft (if any) has been loaded. "load" never
// overwrites a document that's already being edited — even if the loading
// effect runs again (e.g. a remount), newer edits always win. A change that
// would push totals outside the exactly-representable range is refused, so
// the editor can never hold a document it cannot calculate.
function reducer(state: BusinessDocument | null, action: ProviderAction) {
  if (action.type === "load") return state ?? action.document;
  if (action.type === "replace") return action.document;
  if (!state) return state;
  const next = documentReducer(state, action);
  return isCalculable(next) ? next : state;
}

interface DocumentProviderProps {
  children: ReactNode;
  /** Rendered while the saved draft loads. */
  fallback?: ReactNode;
  type?: DocumentType;
  store?: DocumentStore;
  profiles?: BusinessProfileStore;
  assets?: AssetStore;
  numbering?: DocumentNumberSequence;
  /**
   * A document to start with immediately (rendered on the server too)
   * instead of waiting for the store — for demos with fixed content.
   */
  initialDocument?: BusinessDocument;
}

/**
 * Owns the one document the editor and preview share. Loads the saved draft
 * on mount (or starts a new numbered document from the business profile)
 * and autosaves every change — the draft and the profile separately.
 */
export function DocumentProvider({
  children,
  fallback = null,
  type = "invoice",
  store = guestStorage.documents,
  profiles = guestStorage.profiles,
  assets = guestStorage.assets,
  numbering = guestStorage.numbering,
  initialDocument,
}: DocumentProviderProps) {
  const [document, dispatch] = useReducer(reducer, initialDocument ?? null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const latest = useRef(document);

  /** A new numbered document, started from the profile when there is one. */
  const createNew = useCallback(
    async (profile = profiles.load().catch(() => null)) => {
      // Never block on numbering or storage: fall back to a default number.
      const number = await numbering.next(type).catch(() => undefined);
      const fresh = createDocument(type, { number });
      const loaded = await profile;
      return loaded ? applyBusinessProfile(fresh, loaded) : fresh;
    },
    [numbering, profiles, type],
  );

  // Shared across effect re-runs (e.g. StrictMode) so a new document number
  // is only ever allocated once per mount.
  const initial = useRef<Promise<BusinessDocument> | null>(null);

  useEffect(() => {
    let cancelled = false;
    initial.current ??= store
      .load()
      .catch(() => null)
      .then(async (saved) => saved ?? (await createNew()))
      // Last resort: whatever went wrong, the builder must open.
      .catch(() => createDocument(type));
    initial.current.then((next) => {
      if (!cancelled) dispatch({ type: "load", document: next });
    });
    return () => {
      cancelled = true;
    };
  }, [store, createNew, type]);

  // The draft and the profile are saved side by side; the profile is small.
  const save = useCallback(
    async (next: BusinessDocument) => {
      await store.save(next);
      await profiles.save(profileFromDocument(next));
    },
    [store, profiles],
  );

  useEffect(() => {
    latest.current = document;
    if (!document) return;
    const timer = setTimeout(() => {
      save(document).then(
        () => setSaveStatus(isStoragePersistent() ? "saved" : "unavailable"),
        () => setSaveStatus("error"),
      );
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [document, save]);

  // Flush a pending autosave if the tab closes within the debounce window.
  useEffect(() => {
    const flush = () => {
      if (latest.current) save(latest.current).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [save]);

  const reset = useCallback(async () => {
    if (!document) return;
    // Save first so the profile reflects the invoice being left.
    await save(document).catch(() => {});
    await store.clear().catch(() => {});
    const profile = profileFromDocument(document);
    dispatch({ type: "replace", document: await createNew(Promise.resolve(profile)) });
  }, [document, save, store, createNew]);

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
