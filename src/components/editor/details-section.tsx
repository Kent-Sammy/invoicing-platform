"use client";

import { useDocument } from "@/components/document/document-provider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, isCurrencyCode } from "@/config/currencies";
import { DEFAULT_PAYMENT_TERMS } from "@/config/payment-terms";
import { isISODate } from "@/lib/dates";
import type { DocumentAction } from "@/lib/documents";
import type { PaymentTerms } from "@/types/document";

import { EditorSection, Field, FieldRow, TextButton } from "./editor-section";

function DueDateHint({ terms, onReset }: { terms: PaymentTerms; onReset: () => void }) {
  if (terms.type === "net") return <>{terms.days} days after issue date</>;
  if (terms.type === "on_receipt") return <>Due on receipt</>;
  return (
    <span className="flex gap-2">
      Custom date ·<TextButton onClick={onReset}>Reset</TextButton>
    </span>
  );
}

export function DetailsSection() {
  const { document, dispatch } = useDocument();
  const update = (changes: Extract<DocumentAction, { type: "update" }>["changes"]) =>
    dispatch({ type: "update", changes });

  return (
    <EditorSection title="Invoice">
      <FieldRow>
        <Field label="Invoice number" htmlFor="document-number">
          <Input
            id="document-number"
            value={document.number}
            onChange={(event) => update({ number: event.target.value })}
            className="tabular-nums"
          />
        </Field>
        <Field label="Currency" htmlFor="document-currency">
          <Select
            value={document.currency}
            onValueChange={(value) =>
              isCurrencyCode(value) && update({ currency: value })
            }
          >
            <SelectTrigger id="document-currency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CURRENCIES).map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <span className="w-3.5 text-muted-foreground">{currency.symbol}</span>
                  {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Issue date" htmlFor="document-issue-date">
          <Input
            id="document-issue-date"
            type="date"
            value={document.issueDate}
            onChange={(event) =>
              isISODate(event.target.value) &&
              update({ issueDate: event.target.value })
            }
          />
        </Field>
        <Field
          label="Due date"
          htmlFor="document-due-date"
          hint={
            <DueDateHint
              terms={document.paymentTerms}
              onReset={() => update({ paymentTerms: DEFAULT_PAYMENT_TERMS })}
            />
          }
        >
          <Input
            id="document-due-date"
            type="date"
            value={document.dueDate}
            min={document.issueDate}
            onChange={(event) =>
              isISODate(event.target.value) &&
              update({ dueDate: event.target.value })
            }
          />
        </Field>
      </FieldRow>
    </EditorSection>
  );
}
