"use client";

import { useEffect, useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";

export interface FormattedInputProps
  extends Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  value: number;
  onValueChange: (value: number) => void;
  /** Display text for a value; empty string shows the placeholder. */
  format: (value: number) => string;
  /** Parses typed text; null means "not valid yet" and leaves the value unchanged. */
  parse: (text: string) => number | null;
  /** Largest accepted value. Larger input is shown as invalid and never committed. */
  max?: number;
  /** Told whenever typed input starts or stops exceeding `max`. */
  onExceedsMax?: (exceeds: boolean) => void;
}

/**
 * A numeric text field that lets people type freely ("1,25", "250000.") and
 * only commits valid values. Shows the formatted value when not focused.
 */
export function FormattedInput({
  value,
  onValueChange,
  format,
  parse,
  max,
  onExceedsMax,
  onFocus,
  onBlur,
  ...props
}: FormattedInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const parsed = draft === null || draft.trim() === "" ? null : parse(draft);
  const exceeds = parsed !== null && max !== undefined && parsed > max;
  const invalid = draft !== null && draft.trim() !== "" && (parsed === null || exceeds);

  useEffect(() => {
    onExceedsMax?.(exceeds);
  }, [exceeds, onExceedsMax]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-invalid={invalid || undefined}
      value={draft ?? format(value)}
      onFocus={(event) => {
        setDraft(format(value));
        onFocus?.(event);
      }}
      onChange={(event) => {
        const text = event.target.value;
        setDraft(text);
        const next = text.trim() === "" ? 0 : parse(text);
        if (next !== null && (max === undefined || next <= max)) onValueChange(next);
      }}
      onBlur={(event) => {
        setDraft(null);
        onBlur?.(event);
      }}
    />
  );
}
