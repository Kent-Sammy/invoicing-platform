import { describe, expect, it } from "vitest";

import { createSampleDocument } from "@/data/sample-document";
import { createDocument } from "@/lib/documents";
import { createMemoryStorage } from "@/test/memory-storage";

import { createLocalStorageProfileStore } from "./local-storage-profile-store";
import { applyBusinessProfile, profileFromDocument } from "./profile";

describe("business profile", () => {
  const previous = { ...createSampleDocument(), branding: { templateId: "elegant" as const, brandColor: "#e4572e", logo: { assetId: "logo-1" } } };
  const profile = profileFromDocument(previous);
  const next = applyBusinessProfile(createDocument("invoice", { number: "INV-0043", today: "2026-11-01" }), profile);

  it("carries the business identity, logo and payment details to the next invoice", () => {
    expect(next.business).toEqual(previous.business);
    expect(next.branding).toEqual(previous.branding);
    expect(next.paymentOptions).toEqual(previous.paymentOptions);
    expect(next.currency).toBe(previous.currency);
    expect(next.tax).toEqual(previous.tax);
  });

  it("starts the invoice itself fresh", () => {
    expect(next.number).toBe("INV-0043");
    expect(next.client.name).toBe("");
    expect(next.items).toHaveLength(1);
    expect(next.items[0].description).toBe("");
    expect(next.discount).toBeNull();
    expect(next.notes).toBe("");
    expect(next.terms).toBe("");
    expect(next.issueDate).toBe("2026-11-01");
    expect(next.dueDate).toBe("2026-11-15"); // the profile's net-14 terms
  });
});

describe("localStorage profile store", () => {
  it("saves and restores a profile, separately from the draft", async () => {
    const storage = createMemoryStorage();
    const store = createLocalStorageProfileStore("profile", () => storage);
    const profile = profileFromDocument(createSampleDocument());

    await store.save(profile);

    expect(await store.load()).toEqual(profile);
    expect(storage.length).toBe(1);
  });

  it("ignores missing, corrupt or invalid profiles", async () => {
    const load = (raw?: string) =>
      createLocalStorageProfileStore("profile", () => createMemoryStorage(raw ? { profile: raw } : {})).load();
    expect(await load()).toBeNull();
    expect(await load("{oops")).toBeNull();
    expect(await load(JSON.stringify({ version: 1, profile: { defaults: {} } }))).toBeNull();
    expect(await load(JSON.stringify({ version: 99, profile: profileFromDocument(createSampleDocument()) }))).toBeNull();
  });
});
