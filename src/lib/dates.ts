import type { ISODate } from "@/types/document";

/** Today's date in the user's local timezone, as an ISO date. */
export function todayISODate(now: Date = new Date()): ISODate {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "2026-10-07" → "7 Oct 2026" (en-GB) / "Oct 7, 2026" (en-US). */
export function formatISODate(date: ISODate, locale: string): string {
  // Interpret as UTC and format in UTC so the calendar date never shifts.
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
