import { createLocalStorageAssetStore } from "@/lib/assets";
import { createLocalStorageNumberSequence } from "@/lib/numbering";
import { createLocalStorageDocumentStore } from "@/lib/persistence";
import { createLocalStorageProfileStore } from "@/lib/profile";

/**
 * Guest-mode storage, all in this browser. When accounts arrive, an
 * account-backed set (database, cloud assets, server numbering) replaces
 * this one object; nothing else changes.
 *
 * The invoice draft and the business profile are separate stores: the
 * draft is one invoice; the profile is the business behind every invoice.
 */
export const guestStorage = {
  documents: createLocalStorageDocumentStore(),
  profiles: createLocalStorageProfileStore(),
  assets: createLocalStorageAssetStore(),
  numbering: createLocalStorageNumberSequence(),
};
