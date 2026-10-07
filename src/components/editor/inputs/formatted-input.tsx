"use client";

import { useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";

export interface FormattedInputProps
  extends Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> {
  value: number;
  onValueChange: (value: number) => void;
  /** Display text for a value; empty string shows the placeholder. */
  format: (value: number) => string;
  /** Parses typed text; null means "not valid yet" and leaves the value unchanged. */
  parse: (text: string) => number | null;
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
  onFocus,
  onBlur,
  ...props
}: FormattedInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = draft !== null && draft.trim() !== "" && parse(draft) === null;

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
        const parsed = text.trim() === "" ? 0 : parse(text);
        if (parsed !== null) onValueChange(parsed);
      }}
      onBlur={(event) => {
        setDraft(null);
        onBlur?.(event);
      }}
    />
  );
}
