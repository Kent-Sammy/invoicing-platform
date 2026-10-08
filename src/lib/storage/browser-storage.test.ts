import { afterEach, describe, expect, it, vi } from "vitest";

import { createMemoryStorage } from "./browser-storage";

async function freshModule() {
  vi.resetModules();
  return import("./browser-storage");
}

describe("browser storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses localStorage when the browser allows it", async () => {
    const local = createMemoryStorage();
    vi.stubGlobal("window", { localStorage: local });
    const { getBrowserStorage, isStoragePersistent } = await freshModule();
    expect(getBrowserStorage()).toBe(local);
    expect(isStoragePersistent()).toBe(true);
  });

  it("falls back to memory when storage is blocked", async () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
    const { getBrowserStorage, isStoragePersistent } = await freshModule();
    const storage = getBrowserStorage();
    storage.setItem("a", "1");
    expect(storage.getItem("a")).toBe("1");
    expect(isStoragePersistent()).toBe(false);
  });
});
