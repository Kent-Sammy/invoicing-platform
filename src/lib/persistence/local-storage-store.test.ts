import { describe, expect, it } from "vitest";

import { createSampleDocument } from "@/data/sample-document";

import { createLocalStorageDocumentStore } from "./local-storage-store";

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  } as Storage;
}

const KEY = "test-draft";

function storeWith(initial?: Record<string, string>) {
  const storage = createMemoryStorage(initial);
  return createLocalStorageDocumentStore(KEY, () => storage);
}

describe("localStorage document store", () => {
  it("returns null when there is no draft", async () => {
    expect(await storeWith().load()).toBeNull();
  });

  it("restores a saved draft", async () => {
    const store = storeWith();
    const document = createSampleDocument();

    await store.save(document);

    expect(await store.load()).toEqual(document);
  });

  it("clears the draft", async () => {
    const store = storeWith();
    await store.save(createSampleDocument());

    await store.clear();

    expect(await store.load()).toBeNull();
  });

  it("ignores corrupt data", async () => {
    expect(await storeWith({ [KEY]: "{not json" }).load()).toBeNull();
  });

  it("ignores drafts from another schema version", async () => {
    const stored = JSON.stringify({ version: 0, document: createSampleDocument() });
    expect(await storeWith({ [KEY]: stored }).load()).toBeNull();
  });

  it("ignores drafts that are not valid documents", async () => {
    const stored = JSON.stringify({ version: 1, document: { id: "x", items: "nope" } });
    expect(await storeWith({ [KEY]: stored }).load()).toBeNull();
  });
});
