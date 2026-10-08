"use client";

import { cn } from "@/lib/utils";

import { FormattedInput, type FormattedInputProps } from "./formatted-input";

const DECIMAL = /^\d*\.?\d{0,4}$/;

interface DecimalInputProps
  extends Omit<FormattedInputProps, "format" | "parse"> {
  /** Text shown after the number, e.g. "%". */
  suffix?: string;
}

/** Non-negative number with up to 4 decimal places (quantities, rates). */
export function DecimalInput({ suffix, className, ...props }: DecimalInputProps) {
  return (
    <div className="relative">
      <FormattedInput
        {...props}
        className={cn("tabular-nums", suffix && "pr-6", className)}
        format={(value) => (value === 0 ? "" : String(value))}
        parse={(text) => {
          const cleaned = text.replace(/[,\s]/g, "");
          if (!DECIMAL.test(cleaned) || cleaned === ".") return null;
          return Number(cleaned);
        }}
      />
      {suffix && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground"
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
