"use client";

import { ArrowRight, Eye } from "lucide-react";

import { useDocument } from "@/components/document/document-provider";
import { Button } from "@/components/ui/button";
import { describeMissing, missingRequirements } from "@/lib/documents";
import { formatMoney } from "@/lib/money";

/**
 * Pinned under the editor: the running total and the one primary action.
 * "Review invoice" waits for the minimum a meaningful invoice needs and
 * says what's left — no "Save & continue": saving is automatic.
 */
export function CreateFooter({ onReview, onPreview }: { onReview: () => void; onPreview: () => void }) {
  const { document, totals } = useDocument();
  const missing = missingRequirements(document);
  const ready = missing.length === 0;

  return (
    <div className="shrink-0 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 print:hidden">
      <div className="flex items-center gap-2">
        <div className="min-w-0">
          <p className="text-[12px] text-muted-foreground">Total</p>
          <p className="truncate text-[15px] font-semibold tabular-nums">{formatMoney(totals.total, document.currency)}</p>
        </div>
        {/* Phones and tablets: the preview lives behind this button. */}
        <Button variant="outline" size="icon" className="ml-auto lg:hidden" onClick={onPreview} aria-label="Preview">
          <Eye />
        </Button>
        <Button
          onClick={onReview}
          disabled={!ready}
          aria-describedby={ready ? undefined : "review-hint"}
          className="lg:ml-auto"
        >
          Review invoice <ArrowRight />
        </Button>
      </div>
      {!ready && (
        <p id="review-hint" className="mt-1.5 text-right text-[11.5px] text-muted-foreground">
          {describeMissing(missing)}
        </p>
      )}
    </div>
  );
}
