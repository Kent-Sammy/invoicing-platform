"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { guestStorage } from "@/lib/guest";

/**
 * Last-resort recovery screen for the builder. "Start a new invoice" drops
 * only the current draft — the business profile stays.
 */
export function BuilderError({ onRetry }: { onRetry: () => void }) {
  async function startNew() {
    await guestStorage.documents.clear().catch(() => {});
    window.location.reload();
  }

  return (
    <div role="alert" className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-sm space-y-4 text-center">
        <AlertTriangle className="mx-auto size-6 text-muted-foreground" />
        <div className="space-y-1.5">
          <h1 className="text-base font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            The invoice editor hit an unexpected problem. Your business details are safe.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
          <Button size="sm" onClick={startNew}>
            Start a new invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
