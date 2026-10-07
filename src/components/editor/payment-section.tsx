"use client";

import type { ReactNode } from "react";

import { useDocument } from "@/components/document/document-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { normalizePaymentUrl } from "@/lib/payments";
import type { BankTransferOption, PaymentLinkOption } from "@/types/document";

import { Field, FieldRow, OptionalSection } from "./editor-section";

type LinkDisplay = "button" | "qr" | "both";

function OptionRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  children,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor={id} className="text-[13px] font-normal text-foreground">
            {title}
          </Label>
          <p className="text-[11.5px] text-muted-foreground">{description}</p>
        </div>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {checked && <div className="animate-in space-y-3 duration-150 fade-in-0">{children}</div>}
    </div>
  );
}

export function PaymentSection() {
  const { document, dispatch } = useDocument();
  const { bankTransfer, paymentLink, qrCode } = document.paymentOptions;
  const updateBank = (changes: Partial<BankTransferOption>) =>
    dispatch({ type: "updateBankTransfer", changes });
  const updateLink = (changes: Partial<PaymentLinkOption>) =>
    dispatch({ type: "updatePaymentLink", changes });

  const linkInvalid = paymentLink.url.trim() !== "" && normalizePaymentUrl(paymentLink.url) === null;
  const display: LinkDisplay =
    paymentLink.showButton && qrCode.enabled ? "both" : qrCode.enabled ? "qr" : "button";

  function setDisplay(next: LinkDisplay) {
    updateLink({ showButton: next !== "qr" });
    dispatch({ type: "updateQrCode", changes: { enabled: next !== "button" } });
  }

  return (
    <OptionalSection
      title="Payment options"
      description="Bank transfer, a payment link or a QR code."
      hasContent={bankTransfer.enabled || paymentLink.enabled}
    >
      <OptionRow
        id="payment-bank-enabled"
        title="Bank transfer"
        description="Account details printed on the invoice."
        checked={bankTransfer.enabled}
        onCheckedChange={(enabled) => updateBank({ enabled })}
      >
        <FieldRow>
          <Field label="Bank" htmlFor="payment-bank">
            <Input
              id="payment-bank"
              value={bankTransfer.bankName}
              onChange={(event) => updateBank({ bankName: event.target.value })}
              placeholder="GTBank"
            />
          </Field>
          <Field label="Account number" htmlFor="payment-account-number">
            <Input
              id="payment-account-number"
              inputMode="numeric"
              value={bankTransfer.accountNumber}
              onChange={(event) => updateBank({ accountNumber: event.target.value })}
              placeholder="0123456789"
              className="tabular-nums"
            />
          </Field>
        </FieldRow>
        <Field label="Account name" htmlFor="payment-account-name">
          <Input
            id="payment-account-name"
            value={bankTransfer.accountName}
            onChange={(event) => updateBank({ accountName: event.target.value })}
            placeholder={document.business.name || "Account holder"}
          />
        </Field>
        <Field label="Instructions" htmlFor="payment-instructions">
          <Textarea
            id="payment-instructions"
            value={bankTransfer.instructions}
            onChange={(event) => updateBank({ instructions: event.target.value })}
            placeholder="e.g. Use the invoice number as your payment reference."
            rows={2}
            className="min-h-0 resize-none"
          />
        </Field>
      </OptionRow>

      <OptionRow
        id="payment-link-enabled"
        title="Payment link"
        description="Any checkout or payment page URL."
        checked={paymentLink.enabled}
        onCheckedChange={(enabled) => updateLink({ enabled })}
      >
        <Field
          label="Payment URL"
          htmlFor="payment-url"
          hint={
            linkInvalid ? (
              <span className="text-destructive">Enter a full web link, e.g. https://…</span>
            ) : (
              "Paystack, Flutterwave, Stripe or any payment page."
            )
          }
        >
          <Input
            id="payment-url"
            type="url"
            inputMode="url"
            value={paymentLink.url}
            onChange={(event) => updateLink({ url: event.target.value })}
            placeholder="https://paystack.com/pay/your-page"
            aria-invalid={linkInvalid || undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <div className="space-y-1.5">
          <p className="text-[12px] text-muted-foreground">Show on invoice</p>
          <ToggleGroup
            type="single"
            value={display}
            onValueChange={(next) => next && setDisplay(next as LinkDisplay)}
            aria-label="Show on invoice"
            spacing={0}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {(
              [
                { value: "button", label: "Pay button" },
                { value: "qr", label: "QR code" },
                { value: "both", label: "Both" },
              ] as const
            ).map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="flex-1 font-normal data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-[11.5px] text-muted-foreground">
            The button is clickable in the PDF; the QR code lets printed copies be paid by phone.
          </p>
        </div>
      </OptionRow>
    </OptionalSection>
  );
}
