import { describe, expect, it } from "vitest";

import { createMemoryStorage } from "@/test/memory-storage";

import { createLocalStorageAssetStore } from "./local-storage-asset-store";
import { fitWithin, validateLogoFile } from "./logo";

const MB = 1024 * 1024;

describe("validateLogoFile", () => {
  it("accepts PNG, JPEG, WebP and SVG up to 2 MB", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]) {
      expect(validateLogoFile({ type, size: MB })).toBeNull();
    }
    expect(validateLogoFile({ type: "image/png", size: 2 * MB })).toBeNull();
  });

  it("rejects files over 2 MB", () => {
    expect(validateLogoFile({ type: "image/png", size: 2 * MB + 1 })).toBe("too_large");
  });

  it("rejects unsupported types", () => {
    expect(validateLogoFile({ type: "image/gif", size: 1_000 })).toBe("unsupported_type");
    expect(validateLogoFile({ type: "application/pdf", size: 1_000 })).toBe("unsupported_type");
    expect(validateLogoFile({ type: "", size: 1_000 })).toBe("unsupported_type");
  });
});

describe("fitWithin", () => {
  it("shrinks oversized images, keeping the aspect ratio", () => {
    expect(fitWithin(4000, 2000, 1200)).toEqual({ width: 1200, height: 600 });
  });

  it("leaves small images alone", () => {
    expect(fitWithin(300, 100, 1200)).toEqual({ width: 300, height: 100 });
  });

  it("can scale up to fit (for vector sources)", () => {
    expect(fitWithin(100, 50, 1200, true)).toEqual({ width: 1200, height: 600 });
  });
});

describe("localStorage asset store", () => {
  const asset = {
    mimeType: "image/webp",
    width: 600,
    height: 200,
    byteSize: 12_000,
    dataUrl: "data:image/webp;base64,AAAA",
  };

  function createStore() {
    const storage = createMemoryStorage();
    let next = 0;
    return createLocalStorageAssetStore("asset:", () => storage, () => `id-${++next}`);
  }

  it("stores and retrieves assets by id", async () => {
    const store = createStore();
    const saved = await store.put(asset);

    expect(saved.id).toBe("id-1");
    expect(await store.get("id-1")).toEqual(saved);
  });

  it("deletes assets", async () => {
    const store = createStore();
    const saved = await store.put(asset);

    await store.delete(saved.id);

    expect(await store.get(saved.id)).toBeNull();
  });

  it("returns null for unknown ids", async () => {
    expect(await createStore().get("missing")).toBeNull();
  });
});
