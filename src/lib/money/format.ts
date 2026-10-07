import { getCurrency, type CurrencyCode } from "@/config/currencies";

import { toDecimalString, type MinorUnits } from "./money";

export interface FormatMoneyOptions {
  /** Include the currency symbol. Defaults to true. */
  symbol?: boolean;
}

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: CurrencyCode, symbol: boolean): Intl.NumberFormat {
  const key = `${currency}:${symbol}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    const { locale, minorUnits } = getCurrency(currency);
    formatter = new Intl.NumberFormat(locale, {
      style: symbol ? "currency" : "decimal",
      currency,
      minimumFractionDigits: minorUnits,
      maximumFractionDigits: minorUnits,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/** Formats minor units for display: (25000000, "NGN") → "₦250,000.00". */
export function formatMoney(
  amount: MinorUnits,
  currency: CurrencyCode,
  { symbol = true }: FormatMoneyOptions = {},
): string {
  // Format from an exact decimal string so display never goes through a float.
  const decimal = toDecimalString(amount, currency) as Intl.StringNumericLiteral;
  return getFormatter(currency, symbol).format(decimal);
}
