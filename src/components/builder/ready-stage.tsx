"use client";

import { ArrowLeft, Check, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";

import { useDocument } from "@/components/document/document-provider";
import { useAsset } from "@/components/document/use-asset";
import { SafeDocumentRenderer } from "@/components/preview/safe-document-renderer";
import { ScaledDocument } from "@/components/preview/scaled-document";
import { Button } from "@/components/ui/button";
import { formatISODate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { normalizePaymentUrl } from "@/lib/payments";

import { NewInvoiceButton, PrintButton } from "./builder-header";

function CopyPaymentLink({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="space-y-1.5">
      <Button variant="outline" size="lg" className="w-full" onClick={copy}>
        {state === "copied" ? <Check /> : <Copy />}
        {state === "copied" ? "Payment link copied" : "Copy payment link"}
      </Button>
      {state === "failed" && (
        // Clipboard blocked: show the link so it can be copied by hand.
        <input
          readOnly
          value={url}
          aria-label="Payment link"
          onFocus={(event) => event.target.select()}
          autoFocus
          className="w-full rounded-md border bg-muted/40 px-2 py-1.5 font-mono text-[12px]"
        />
      )}
    </div>
  );
}

/**
 * Stage 3: completion. The invoice is the hero, exactly as it will print;
 * the panel holds the few things left to do with it.
 */
export function ReadyStage({
  exported,
  onEdit,
  onNew,
  onPrinted,
}: {
  exported: boolean;
  onEdit: () => void;
  /** After a new invoice has started. */
  onNew: () => void;
  onPrinted: () => void;
}) {
  const { document, totals, assets } = useDocument();
  const asset = useAsset(document.branding.logo, assets);
  const logo = asset && { src: asset.dataUrl, width: asset.width, height: asset.height };
  const { paymentLink } = document.paymentOptions;
  const paymentUrl = paymentLink.enabled ? normalizePaymentUrl(paymentLink.url) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-canvas lg:flex-row lg:overflow-hidden print:hidden">
      <aside className="shrink-0 border-b bg-background px-5 py-6 sm:px-8 lg:w-[360px] lg:overflow-y-auto lg:border-r lg:border-b-0 lg:py-10">
        <CheckCircle2 className="size-6 text-emerald-600" aria-hidden />
        <h1 className="mt-3 text-[20px] font-semibold tracking-tight">Your invoice is ready</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {document.number} for {document.client.name} · due {formatISODate(document.dueDate, document.business.locale)}
        </p>
        <p className="mt-4 text-[26px] font-semibold tracking-tight tabular-nums">
          {formatMoney(totals.total, document.currency)}
        </p>

        <div className="mt-6 space-y-2.5">
          <PrintButton size="lg" className="w-full" onPrinted={onPrinted} />
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Opens your browser&apos;s print dialog. Choose “Save as PDF” to download a copy.
          </p>
          {paymentUrl && <CopyPaymentLink url={paymentUrl} />}
        </div>

        <div className="mt-6 flex flex-col items-start gap-1 border-t pt-4">
          <Button variant="ghost" size="sm" className="-ml-2.5" onClick={onEdit}>
            <ArrowLeft /> Edit invoice
          </Button>
          <NewInvoiceButton variant="panel" exported={exported} onStarted={onNew} />
        </div>
      </aside>
      <section aria-label="Invoice" className="min-w-0 flex-1 px-3 py-5 sm:px-6 lg:overflow-y-auto lg:px-10 lg:py-10">
        <ScaledDocument maxScale={1.25}>
          <div className="shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-16px_rgba(0,0,0,0.18)]">
            {/* Exactly what prints: no sample content. */}
            <SafeDocumentRenderer document={document} logo={logo} printable={false} />
          </div>
        </ScaledDocument>
      </section>
    </div>
  );
}
