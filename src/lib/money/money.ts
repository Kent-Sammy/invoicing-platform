import { getCurrency, type CurrencyCode } from "@/config/currencies";

import { parseDecimal, toSafeInteger } from "./decimal";

/**
 * An amount of money as an integer number of minor units (kobo, cents,
 * pence) in the document's currency. ₦250,000 → 25_000_000.
 * Money is never stored or calculated in major units or as a float.
 */
export type MinorUnits = number;

/**
 * Parses user input in major units ("1,250.50") into minor units.
 * Extra decimal places are rounded half away from zero. Returns null for
 * input that is not a number or is too large to represent safely.
 */
export function parseMoney(input: string, currency: CurrencyCode): MinorUnits | null {
  const scaled = parseDecimal(input, getCurrency(currency).minorUnits);
  if (scaled === null) return null;
  try {
    return toSafeInteger(scaled);
  } catch {
    return null;
  }
}

/** Exact major-unit decimal string for an amount: 10050 → "100.50". */
export function toDecimalString(amount: MinorUnits, currency: CurrencyCode): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(`Expected an integer amount in minor units, got ${amount}`);
  }
  const { minorUnits } = getCurrency(currency);
  const digits = Math.abs(amount).toString().padStart(minorUnits + 1, "0");
  const whole = digits.slice(0, digits.length - minorUnits);
  const fraction = digits.slice(digits.length - minorUnits);
  const sign = amount < 0 ? "-" : "";
  return minorUnits === 0 ? `${sign}${whole}` : `${sign}${whole}.${fraction}`;
}
