import { getCurrency, type CurrencyCode } from "./currencies";

/**
 * Input limits. Far beyond any real invoice, and low enough that every
 * total stays exact (see lib/money): a price, fixed discount or line total
 * is at most 999,999,999,999.99 in the document currency.
 */
export const MAX_AMOUNT_MAJOR = 999_999_999_999;

/** Largest quantity on one line. */
export const MAX_QUANTITY = 1_000_000;

/** The largest amount in minor units for a currency (999,999,999,999.99). */
export function maxAmount(currency: CurrencyCode): number {
  const scale = 10 ** getCurrency(currency).minorUnits;
  return (MAX_AMOUNT_MAJOR + 1) * scale - 1;
}
