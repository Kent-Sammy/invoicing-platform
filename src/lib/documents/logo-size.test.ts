import { describe, expect, it } from "vitest";

import { logoSize } from "./logo-size";

describe("logoSize", () => {
  it("gives square and wide logos the same visual area", () => {
    const square = logoSize(500, 500);
    const wide = logoSize(1200, 300);

    expect(square).toEqual({ width: 16.1, height: 16.1 });
    expect(wide).toEqual({ width: 32.2, height: 8.1 });
    expect(square.width * square.height).toBeCloseTo(wide.width * wide.height, -1);
  });

  it("keeps the aspect ratio", () => {
    const { width, height } = logoSize(1600, 400);
    expect(width / height).toBeCloseTo(4, 1);
  });

  it("clamps very wide and very tall logos to the box", () => {
    expect(logoSize(2000, 100).width).toBe(60);
    expect(logoSize(100, 400).height).toBe(20);
  });

  it("falls back to a square for unknown sizes", () => {
    expect(logoSize(0, 0)).toEqual({ width: 20, height: 20 });
  });
});
