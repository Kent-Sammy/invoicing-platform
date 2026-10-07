import { describe, expect, it } from "vitest";

import { addDays, formatISODate, isISODate, todayISODate } from "./dates";

describe("formatISODate", () => {
  it("formats with the given locale", () => {
    expect(formatISODate("2026-10-07", "en-NG")).toBe("7 Oct 2026");
    expect(formatISODate("2026-10-07", "en-US")).toBe("Oct 7, 2026");
  });

  it("never shifts the calendar date", () => {
    expect(formatISODate("2026-01-01", "en-NG")).toBe("1 Jan 2026");
  });

  it("falls back to the default locale for an invalid locale", () => {
    expect(formatISODate("2026-10-07", "not a locale!")).toBe("7 Oct 2026");
  });

  it("returns unparseable input unchanged", () => {
    expect(formatISODate("", "en-NG")).toBe("");
    expect(formatISODate("2026-02-31", "en-NG")).toBe("2026-02-31");
  });
});

describe("addDays", () => {
  it("handles month and year boundaries", () => {
    expect(addDays("2026-10-07", 14)).toBe("2026-10-21");
    expect(addDays("2026-01-25", 14)).toBe("2026-02-08");
    expect(addDays("2026-12-25", 14)).toBe("2027-01-08");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("rejects invalid dates", () => {
    expect(() => addDays("nope", 1)).toThrow(RangeError);
  });
});

describe("isISODate", () => {
  it("accepts only real calendar dates", () => {
    expect(isISODate("2026-10-07")).toBe(true);
    expect(isISODate("2026-02-31")).toBe(false);
    expect(isISODate("07/10/2026")).toBe(false);
  });
});

describe("todayISODate", () => {
  it("uses the local calendar date", () => {
    expect(todayISODate(new Date(2026, 9, 7, 23, 59))).toBe("2026-10-07");
  });
});
