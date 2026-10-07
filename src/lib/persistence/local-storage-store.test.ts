import { describe, expect, it } from "vitest";

import { createSampleDocument } from "@/data/sample-document";
import { createMemoryStorage } from "@/test/memory-storage";

import { createLocalStorageDocumentStore } from "./local-storage-store";

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

  it("ignores drafts from versions it can't migrate", async () => {
    const stored = JSON.stringify({ version: 1, document: createSampleDocument() });
    expect(await storeWith({ [KEY]: stored }).load()).toBeNull();
  });

  it("ignores drafts that are not valid documents", async () => {
    const stored = JSON.stringify({ version: 4, document: { id: "x", items: "nope" } });
    expect(await storeWith({ [KEY]: stored }).load()).toBeNull();
  });

  it("upgrades v3 drafts: the old near-black default becomes 'no colour chosen'", async () => {
    const sample = createSampleDocument();
    const old = (brandColor: string) =>
      JSON.stringify({ version: 3, document: { ...sample, branding: { ...sample.branding, brandColor } } });

    expect((await storeWith({ [KEY]: old("#171717") }).load())?.branding.brandColor).toBeNull();
    expect((await storeWith({ [KEY]: old("#4f46e5") }).load())?.branding.brandColor).toBe("#4f46e5");
  });

  it("upgrades v2 drafts, moving bank details into payment options", async () => {
    const { paymentOptions, ...rest } = createSampleDocument();
    const { bankName, accountName, accountNumber, instructions } = paymentOptions.bankTransfer;
    const bank = { bankName, accountName, accountNumber, instructions };
    const stored = JSON.stringify({ version: 2, document: { ...rest, paymentDetails: bank } });

    const loaded = await storeWith({ [KEY]: stored }).load();

    expect(loaded?.paymentOptions.bankTransfer).toEqual({ enabled: true, ...bank });
    expect(loaded?.paymentOptions.paymentLink.enabled).toBe(false);
    expect(loaded).not.toHaveProperty("paymentDetails");
  });
});
