"use client";

import { useDocument } from "@/components/document/document-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatMoney } from "@/lib/money";
import type { Discount, DocumentTax, TaxMode } from "@/types/document";

import { DecimalInput } from "./inputs/decimal-input";
import { MoneyInput } from "./inputs/money-input";
import { Field, useFieldId } from "./editor-section";

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      aria-label={label}
      spacing={0}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="flex-1 font-normal data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function ToggleRow({
  id,
  title,
  summary,
  checked,
  onCheckedChange,
}: {
  id: string;
  title: string;
  summary: string | null;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-[13px] font-normal text-foreground">
        {title}
      </Label>
      <div className="flex items-center gap-3">
        {summary && <span className="text-[12.5px] text-muted-foreground tabular-nums">{summary}</span>}
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}

/**
 * Switching between percent and amount keeps the discount the client gets:
 * ₦50,000 off ₦500,000 becomes 10%, and back. Percentages keep 2 decimals.
 */
function convertDiscount(type: Discount["type"], amount: number, subtotal: number): Discount {
  if (type === "fixed") return { type, amount };
  const value = subtotal > 0 ? Math.round((amount / subtotal) * 10_000) / 100 : 0;
  return { type, value: Math.min(value, 100) };
}

const TAX_MODE_HINT: Record<TaxMode, (label: string) => string> = {
  exclusive: (label) => `Prices exclude ${label}; it's added on top.`,
  inclusive: (label) => `Prices already include ${label}.`,
};

/** Tax and discount, shown under the items' subtotal. */
export function Adjustments() {
  const { document, totals, dispatch } = useDocument();
  const { tax, discount, currency } = document;
  const updateTax = (changes: Partial<DocumentTax>) => dispatch({ type: "updateTax", changes });
  const money = (amount: number) => formatMoney(amount, currency);
  const taxLabel = tax.label.trim() || "tax";
  const fieldId = useFieldId();

  return (
    <div className="space-y-3 border-t border-border/60 pt-3">
      <div className="space-y-3">
        <ToggleRow
          id={fieldId("tax-enabled")}
          title="Tax"
          summary={tax.enabled ? money(totals.taxTotal) : null}
          checked={tax.enabled}
          onCheckedChange={(enabled) => updateTax({ enabled })}
        />
        {tax.enabled && (
          <div className="animate-in space-y-3 duration-150 fade-in-0">
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Field label="Name" htmlFor={fieldId("tax-label")}>
                <Input
                  id={fieldId("tax-label")}
                  value={tax.label}
                  onChange={(event) => updateTax({ label: event.target.value })}
                  placeholder="VAT"
                />
              </Field>
              <Field label="Rate" htmlFor={fieldId("tax-rate")}>
                <DecimalInput
                  id={fieldId("tax-rate")}
                  value={tax.rate}
                  onValueChange={(rate) => updateTax({ rate })}
                  max={100}
                  suffix="%"
                  placeholder="0"
                />
              </Field>
            </div>
            <Segmented
              label="Tax pricing"
              value={tax.mode}
              onChange={(mode) => updateTax({ mode })}
              options={[
                { value: "exclusive", label: "Tax exclusive" },
                { value: "inclusive", label: "Tax inclusive" },
              ]}
            />
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">
              {TAX_MODE_HINT[tax.mode](taxLabel)} The rate is a suggestion — use the one that
              applies to your business.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border/60 pt-3">
        <ToggleRow
          id={fieldId("discount-enabled")}
          title="Discount"
          summary={discount ? `−${money(totals.discount)}` : null}
          checked={discount !== null}
          onCheckedChange={(enabled) =>
            dispatch({
              type: "update",
              changes: { discount: enabled ? { type: "percentage", value: 0 } : null },
            })
          }
        />
        {discount && (
          <div className="grid animate-in grid-cols-[1fr_9rem] items-end gap-3 duration-150 fade-in-0">
            <Segmented
              label="Discount type"
              value={discount.type}
              onChange={(type) =>
                dispatch({
                  type: "update",
                  changes: { discount: convertDiscount(type, totals.discount, totals.subtotal) },
                })
              }
              options={[
                { value: "percentage", label: "Percent" },
                { value: "fixed", label: "Amount" },
              ]}
            />
            {discount.type === "percentage" ? (
              <DecimalInput
                value={discount.value}
                onValueChange={(value) =>
                  dispatch({ type: "update", changes: { discount: { type: "percentage", value } } })
                }
                max={100}
                suffix="%"
                placeholder="0"
                aria-label="Discount percentage"
              />
            ) : (
              <MoneyInput
                value={discount.amount}
                onValueChange={(amount) =>
                  dispatch({ type: "update", changes: { discount: { type: "fixed", amount } } })
                }
                currency={currency}
                placeholder="0.00"
                aria-label="Discount amount"
              />
            )}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between border-t border-border/60 pt-3 text-[13px]">
        <span className="font-medium">Total</span>
        <span className="font-semibold tabular-nums">{money(totals.total)}</span>
      </div>
    </div>
  );
}
