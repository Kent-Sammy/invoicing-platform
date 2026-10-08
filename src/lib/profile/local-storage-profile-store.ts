import { createDocument, isBusinessDocument } from "@/lib/documents";
import { getBrowserStorage } from "@/lib/storage";
import type { BusinessProfile } from "@/types/business-profile";

import { applyBusinessProfile } from "./profile";
import type { BusinessProfileStore } from "./profile-store";

export const GUEST_PROFILE_KEY = "invoice-platform:business-profile";
const PROFILE_VERSION = 1;

/**
 * A stored profile is valid if a document built from it passes the same
 * structural checks as a saved draft — one set of rules for both.
 */
export function isBusinessProfile(value: unknown): value is BusinessProfile {
  if (typeof value !== "object" || value === null || !("defaults" in value)) return false;
  try {
    const probe = applyBusinessProfile(
      createDocument("invoice", { today: "2026-01-01" }),
      value as BusinessProfile,
    );
    return isBusinessDocument(probe);
  } catch {
    return false;
  }
}

/** Guest business profile, kept in this browser apart from the draft. */
export function createLocalStorageProfileStore(
  key: string = GUEST_PROFILE_KEY,
  getStorage: () => Storage = getBrowserStorage,
): BusinessProfileStore {
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
          stored.version === PROFILE_VERSION &&
          "profile" in stored &&
          isBusinessProfile(stored.profile)
        ) {
          return stored.profile;
        }
      } catch {
        // Corrupt JSON: treat as no profile.
      }
      return null;
    },

    async save(profile) {
      getStorage().setItem(
        key,
        JSON.stringify({ version: PROFILE_VERSION, savedAt: new Date().toISOString(), profile }),
      );
    },
  };
}
