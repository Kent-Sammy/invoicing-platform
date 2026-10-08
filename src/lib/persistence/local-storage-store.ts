import { isCalculable } from "@/lib/calculations";
import { isBusinessDocument } from "@/lib/documents";
import { getBrowserStorage } from "@/lib/storage";
import type { BusinessDocument } from "@/types/document";

import type { DocumentStore } from "./document-store";
import { migrateDocument, SCHEMA_VERSION } from "./migrations";

export const GUEST_DRAFT_KEY = "invoice-platform:guest-draft";

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
  getStorage: () => Storage = getBrowserStorage,
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
          typeof stored.version === "number" &&
          "document" in stored
        ) {
          // Older drafts are upgraded; anything unrecognisable is ignored.
          const document = migrateDocument(stored.version, stored.document);
          if (isBusinessDocument(document) && isCalculable(document)) return document;
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
