"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { useDocument } from "@/components/document/document-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CurrencyCode } from "@/config/currencies";
import { createItem } from "@/lib/documents";
import { formatMoney, type MinorUnits } from "@/lib/money";
import type { DocumentItem } from "@/types/document";

import { DecimalInput } from "./inputs/decimal-input";
import { MoneyInput } from "./inputs/money-input";
import { EditorSection } from "./editor-section";

interface ItemRowProps {
  item: DocumentItem;
  index: number;
  amount: MinorUnits;
  currency: CurrencyCode;
  autoFocus: boolean;
  onChange: (changes: Partial<Omit<DocumentItem, "id">>) => void;
  onRemove: () => void;
  onEnter: () => void;
}

function ItemRow({ item, index, amount, currency, autoFocus, onChange, onRemove, onEnter }: ItemRowProps) {
  const descriptionRef = useRef<HTMLInputElement>(null);
  const label = `Item ${index + 1}`;

  useEffect(() => {
    if (autoFocus) descriptionRef.current?.focus();
  }, [autoFocus]);

  const submitOnEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onEnter();
    }
  };

  return (
    <li className="group animate-in border-b border-border/60 py-3.5 duration-150 fade-in-0 first:pt-0">
      <div className="flex items-center gap-1.5">
        <Input
          ref={descriptionRef}
          value={item.description}
          onChange={(event) => onChange({ description: event.target.value })}
          onKeyDown={submitOnEnter}
          placeholder="What did you provide?"
          aria-label={`${label} description`}
          className="font-medium placeholder:font-normal"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove ${label.toLowerCase()}`}
          className="text-muted-foreground opacity-60 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-foreground"
        >
          <X />
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-2 pr-[34px]">
        <DecimalInput
          value={item.quantity}
          onValueChange={(quantity) => onChange({ quantity })}
          onKeyDown={submitOnEnter}
          placeholder="0"
          aria-label={`${label} quantity`}
          className="w-16 text-center"
        />
        <span aria-hidden className="text-sm text-muted-foreground">
          ×
        </span>
        <div className="w-36">
          <MoneyInput
            value={item.unitPrice}
            onValueChange={(unitPrice) => onChange({ unitPrice })}
            onKeyDown={submitOnEnter}
            currency={currency}
            placeholder="0.00"
            aria-label={`${label} price`}
          />
        </div>
        <output
          aria-label={`${label} amount`}
          className="ml-auto truncate text-right text-sm font-medium tabular-nums"
        >
          {formatMoney(amount, currency)}
        </output>
      </div>
    </li>
  );
}

export function ItemsSection() {
  const { document, totals, dispatch } = useDocument();
  const [focusId, setFocusId] = useState<string | null>(null);

  function addItem() {
    const item = createItem();
    dispatch({ type: "addItem", item });
    setFocusId(item.id);
  }

  const count = document.items.length;

  return (
    <EditorSection
      title="Items"
      className="bg-muted/25"
      meta={
        <span className="text-[11.5px] text-muted-foreground tabular-nums">
          {count} {count === 1 ? "item" : "items"}
        </span>
      }
    >
      {count > 0 && (
        <ul>
          {document.items.map((item, index) => (
            <ItemRow
              key={item.id}
              item={item}
              index={index}
              amount={totals.lineTotals[item.id] ?? 0}
              currency={document.currency}
              autoFocus={item.id === focusId}
              onChange={(changes) => dispatch({ type: "updateItem", id: item.id, changes })}
              onRemove={() => dispatch({ type: "removeItem", id: item.id })}
              onEnter={addItem}
            />
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={addItem}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed text-[13px] text-muted-foreground transition-colors outline-none hover:border-foreground/25 hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Plus className="size-3.5" /> Add item
      </button>
      <div className="flex items-baseline justify-between pt-1 text-[13px]">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium tabular-nums">{formatMoney(totals.subtotal, document.currency)}</span>
      </div>
    </EditorSection>
  );
}
