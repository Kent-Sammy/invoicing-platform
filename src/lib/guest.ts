import { createLocalStorageAssetStore } from "@/lib/assets";
import { createLocalStorageNumberSequence } from "@/lib/numbering";
import { createLocalStorageDocumentStore } from "@/lib/persistence";

/**
 * Guest-mode storage, all in this browser. When accounts arrive, an
 * account-backed set (database, cloud assets, server numbering) replaces
 * this one object; nothing else changes.
 */
export const guestStorage = {
  documents: createLocalStorageDocumentStore(),
  assets: createLocalStorageAssetStore(),
  numbering: createLocalStorageNumberSequence(),
};
