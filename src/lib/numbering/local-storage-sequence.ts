import { getDocumentType } from "@/lib/documents/definitions";
import type { DocumentType } from "@/types/document";

import { formatDocumentNumber } from "./format";
import type { DocumentNumberSequence } from "./sequence";

export const GUEST_SEQUENCE_KEY = "invoice-platform:guest-sequence";

type Counters = Partial<Record<DocumentType, number>>;

function readCounters(storage: Storage, key: string): Counters {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "{}");
    return typeof parsed === "object" && parsed !== null ? (parsed as Counters) : {};
  } catch {
    return {};
  }
}

/**
 * Guest numbering: a per-type counter in this browser. A number is allocated
 * each time a new document is created: INV-0001, INV-0002, …
 */
export function createLocalStorageNumberSequence(
  key: string = GUEST_SEQUENCE_KEY,
  getStorage: () => Storage = () => window.localStorage,
): DocumentNumberSequence {
  return {
    async next(type) {
      const storage = getStorage();
      const counters = readCounters(storage, key);
      const last = counters[type] ?? 0;
      const sequence = (Number.isSafeInteger(last) && last > 0 ? last : 0) + 1;
      storage.setItem(key, JSON.stringify({ ...counters, [type]: sequence }));
      return formatDocumentNumber(getDocumentType(type).numberPrefix, sequence);
    },
  };
}
