"use client";

import { getCurrency, type CurrencyCode } from "@/config/currencies";
import { maxAmount } from "@/config/limits";
import { formatMoney, parseMoney, type MinorUnits } from "@/lib/money";
import { cn } from "@/lib/utils";

import { FormattedInput, type FormattedInputProps } from "./formatted-input";

interface MoneyInputProps
  extends Omit<FormattedInputProps, "value" | "onValueChange" | "format" | "parse"> {
  value: MinorUnits;
  onValueChange: (value: MinorUnits) => void;
  currency: CurrencyCode;
}

/** Amount field in major units ("250,000.00") backed by integer minor units. Capped at the currency's maximum amount unless a lower `max` is given. */
export function MoneyInput({ value, onValueChange, currency, max, className, ...props }: MoneyInputProps) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground"
      >
        {getCurrency(currency).symbol}
      </span>
      <FormattedInput
        {...props}
        className={cn("pl-6 text-right tabular-nums", className)}
        value={value}
        onValueChange={onValueChange}
        max={max ?? maxAmount(currency)}
        format={(amount) => (amount === 0 ? "" : formatMoney(amount, currency, { symbol: false }))}
        parse={(text) => {
          const amount = parseMoney(text, currency);
          return amount !== null && amount >= 0 ? amount : null;
        }}
      />
    </div>
  );
}
