/**
 * The one place the app touches window.localStorage. Every guest store goes
 * through `getBrowserStorage()`, so blocked or missing storage is handled
 * identically everywhere.
 *
 * - Available: localStorage itself (writes may still fail when the quota is
 *   full; stores surface that as a failed save).
 * - Blocked (privacy settings, some in-app browsers, sandboxed iframes):
 *   an in-memory stand-in, so the app still works for the current visit —
 *   nothing is kept after the tab closes, and the UI says so.
 */

/** In-memory Storage: the fallback when the browser blocks localStorage. */
export function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, String(value)),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
}

let resolved: { storage: Storage; persistent: boolean } | null = null;

function resolve(): { storage: Storage; persistent: boolean } {
  if (resolved) return resolved;
  try {
    // Merely reading the property throws when storage is blocked.
    const storage = window.localStorage;
    storage.getItem("invoice-platform:probe");
    resolved = { storage, persistent: true };
  } catch {
    resolved = { storage: createMemoryStorage(), persistent: false };
  }
  return resolved;
}

/** localStorage when the browser allows it, otherwise an in-memory stand-in. */
export function getBrowserStorage(): Storage {
  return resolve().storage;
}

/** False when this browser blocks storage: work lasts only for this visit. */
export function isStoragePersistent(): boolean {
  return resolve().persistent;
}
