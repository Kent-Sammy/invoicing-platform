import { isBusinessDocument } from "@/lib/documents";
import type { BusinessDocument } from "@/types/document";

import type { DocumentStore } from "./document-store";

export const GUEST_DRAFT_KEY = "invoice-platform:guest-draft";

// Bump when BusinessDocument changes shape incompatibly; older drafts are then
// discarded (or migrated, once we have real users' drafts worth keeping).
const SCHEMA_VERSION = 2;

interface StoredDraft {
  version: number;
  savedAt: string;
  document: BusinessDocument;
}

/**
 * Guest draft persistence in the browser. Stores the document only — the
 * model has no payment credentials, and none should ever be added to it.
 */
export function createLocalStorageDocumentStore(
  key: string = GUEST_DRAFT_KEY,
  getStorage: () => Storage = () => window.localStorage,
): DocumentStore {
  return {
    async load() {
      const raw = getStorage().getItem(key);
      if (raw === null) return null;
      try {
        const stored: unknown = JSON.parse(raw);
        if (
          typeof stored === "object" &&
          stored !== null &&
          "version" in stored &&
          stored.version === SCHEMA_VERSION &&
          "document" in stored &&
          isBusinessDocument(stored.document)
        ) {
          return stored.document;
        }
      } catch {
        // Corrupt JSON: fall through and treat as no draft.
      }
      return null;
    },

    async save(document) {
      const stored: StoredDraft = {
        version: SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        document,
      };
      getStorage().setItem(key, JSON.stringify(stored));
    },

    async clear() {
      getStorage().removeItem(key);
    },
  };
}
