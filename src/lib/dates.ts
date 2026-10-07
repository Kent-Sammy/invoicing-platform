import { DEFAULT_COUNTRY, getCountry } from "@/config/countries";
import type { ISODate } from "@/types/document";

export const DEFAULT_LOCALE = getCountry(DEFAULT_COUNTRY).locale;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toUTCDate(date: ISODate): Date | null {
  if (!ISO_DATE_PATTERN.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  // Rejects impossible dates like 2026-02-31, which Date would roll over.
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
  return parsed;
}

/** True for a real calendar date in "YYYY-MM-DD" form. */
export function isISODate(value: string): boolean {
  return toUTCDate(value) !== null;
}

/** Today's date in the user's local timezone, as an ISO date. */
export function todayISODate(now: Date = new Date()): ISODate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Calendar arithmetic on ISO dates, immune to timezones and DST. */
export function addDays(date: ISODate, days: number): ISODate {
  const parsed = toUTCDate(date);
  if (!parsed) throw new RangeError(`Invalid ISO date: ${date}`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

/**
 * The one place dates are formatted for display. Uses the business locale:
 * "2026-10-07" → "7 Oct 2026" (en-NG) / "Oct 7, 2026" (en-US).
 * Unknown locales fall back to the default; unparseable dates are returned as-is.
 */
export function formatISODate(date: ISODate, locale: string): string {
  const parsed = toUTCDate(date);
  if (!parsed) return date;
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    // Interpret and format in UTC so the calendar date never shifts.
    timeZone: "UTC",
  };
  try {
    return new Intl.DateTimeFormat(locale, options).format(parsed);
  } catch {
    return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(parsed);
  }
}
