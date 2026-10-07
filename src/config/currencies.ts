export interface CurrencyDefinition {
  /** ISO 4217 code. */
  code: string;
  name: string;
  symbol: string;
  /** Number of decimal places in the minor unit (2 for kobo, cents, pence). */
  minorUnits: number;
  /** Locale used to format amounts in this currency. */
  locale: string;
}

/**
 * Supported currencies. To add a currency, add an entry here — nothing else
 * in the app hard-codes currency codes.
 */
export const CURRENCIES = {
  NGN: { code: "NGN", name: "Nigerian Naira", symbol: "₦", minorUnits: 2, locale: "en-NG" },
  USD: { code: "USD", name: "US Dollar", symbol: "$", minorUnits: 2, locale: "en-US" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", minorUnits: 2, locale: "en-GB" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", minorUnits: 2, locale: "en-IE" },
} as const satisfies Record<string, CurrencyDefinition>;

export type CurrencyCode = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: CurrencyCode = "NGN";

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && Object.hasOwn(CURRENCIES, value);
}

export function getCurrency(code: CurrencyCode): CurrencyDefinition {
  return CURRENCIES[code];
}
