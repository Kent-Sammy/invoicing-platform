import { describe, expect, it } from "vitest";

import { createMemoryStorage } from "@/test/memory-storage";

import { formatDocumentNumber } from "./format";
import { createLocalStorageNumberSequence } from "./local-storage-sequence";

describe("formatDocumentNumber", () => {
  it("pads the sequence", () => {
    expect(formatDocumentNumber("INV-", 1)).toBe("INV-0001");
    expect(formatDocumentNumber("INV-", 42)).toBe("INV-0042");
  });

  it("grows beyond the padding", () => {
    expect(formatDocumentNumber("INV-", 12345)).toBe("INV-12345");
  });

  it("rejects non-positive sequences", () => {
    expect(() => formatDocumentNumber("INV-", 0)).toThrow(RangeError);
  });
});

describe("local number sequence", () => {
  it("allocates INV-0001, INV-0002, INV-0003 in order", async () => {
    const storage = createMemoryStorage();
    const sequence = createLocalStorageNumberSequence("seq", () => storage);

    expect(await sequence.next("invoice")).toBe("INV-0001");
    expect(await sequence.next("invoice")).toBe("INV-0002");
    expect(await sequence.next("invoice")).toBe("INV-0003");
  });

  it("continues from the stored counter", async () => {
    const storage = createMemoryStorage({ seq: JSON.stringify({ invoice: 41 }) });
    const sequence = createLocalStorageNumberSequence("seq", () => storage);

    expect(await sequence.next("invoice")).toBe("INV-0042");
  });

  it("restarts safely from corrupt data", async () => {
    const storage = createMemoryStorage({ seq: "{oops" });
    const sequence = createLocalStorageNumberSequence("seq", () => storage);

    expect(await sequence.next("invoice")).toBe("INV-0001");
  });
});
