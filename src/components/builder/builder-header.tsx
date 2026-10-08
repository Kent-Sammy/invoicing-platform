"use client";

import { AlertCircle, Check, FilePlus2, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { NuhmeraLogo } from "@/components/brand/nuhmera-logo";
import { useDocument } from "@/components/document/document-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { describeMissing, missingRequirements } from "@/lib/documents";

import { BuilderStepper } from "./builder-stepper";
import { printDocument } from "./print-document";
import type { BuilderStage } from "./use-builder-stage";

function SaveStatus() {
  const { saveStatus } = useDocument();
  if (saveStatus === "error") {
    return (
      <span
        className="flex items-center gap-1.5 text-[12.5px] text-destructive"
        title="Your browser's storage may be full. Save your PDF to keep a copy."
      >
        <AlertCircle className="size-3.5" /> Not saved
      </span>
    );
  }
  if (saveStatus === "unavailable") {
    return (
      <span
        className="flex items-center gap-1.5 text-[12.5px] text-amber-700 dark:text-amber-500"
        title="This browser is blocking storage, so your invoice is kept only until you close this tab. Save your PDF to keep a copy."
      >
        <AlertCircle className="size-3.5" />
        <span className="hidden sm:inline">Not saved in this browser</span>
        <span className="sm:hidden">Not saved</span>
      </span>
    );
  }
  if (saveStatus === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground" title="Saved in this browser">
        <Check className="size-3.5" /> <span className="hidden sm:inline">Saved in this browser</span>
        <span className="sr-only sm:hidden">Saved</span>
      </span>
    );
  }
  return null;
}

/**
 * Starts the next invoice. Asks first only while the current one hasn't
 * been printed or saved as a PDF — afterwards there's nothing to lose.
 */
export function NewInvoiceButton({
  exported,
  onStarted,
  variant = "header",
}: {
  exported: boolean;
  onStarted: () => void;
  /** header: compact icon button · panel: a labelled text button (Ready stage). */
  variant?: "header" | "panel";
}) {
  const { reset } = useDocument();
  const [confirming, setConfirming] = useState(false);
  const start = async () => {
    setConfirming(false);
    await reset();
    onStarted();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label={variant === "header" ? "New invoice" : undefined}
        className={variant === "panel" ? "-ml-2.5 text-muted-foreground" : undefined}
        onClick={() => (exported ? start() : setConfirming(true))}
      >
        <FilePlus2 />
        {variant === "header" ? <span className="hidden sm:inline">New</span> : "Start a new invoice"}
      </Button>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This invoice hasn&apos;t been saved as a PDF yet. Starting a new one clears its client,
              items and notes. Your business details, logo and payment details are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={start}>Start new</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Opens the browser's print dialog, where the user can save a PDF — the
 * label says so rather than promising a direct download. Shown in Ready,
 * which is only reachable once the invoice has a sender, a recipient and
 * something to pay for; the check here is a last safeguard.
 */
export function PrintButton({
  className,
  size = "sm",
  onPrinted,
}: {
  className?: string;
  size?: "sm" | "lg";
  onPrinted?: () => void;
}) {
  const { document } = useDocument();
  const complete = missingRequirements(document).length === 0;

  return (
    <Button
      size={size}
      disabled={!complete}
      onClick={() => {
        onPrinted?.();
        printDocument(document);
      }}
      className={className}
      title="Opens your browser's print dialog — choose “Save as PDF” to download a copy."
    >
      <Printer />
      Save / Print PDF
    </Button>
  );
}

interface BuilderHeaderProps {
  stage: BuilderStage;
  onStage: (stage: BuilderStage) => void;
  /** The current invoice has been printed / saved as PDF. */
  exported: boolean;
}

/** Name, the Template · Create · Ready stepper, autosave status and New. No save button: saving is automatic. */
export function BuilderHeader({ stage, onStage, exported }: BuilderHeaderProps) {
  const { document } = useDocument();
  const missing = missingRequirements(document);

  return (
    <header className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 sm:px-4 print:hidden">
      <Link href="/" aria-label={`${siteConfig.name} home`} className="hidden w-fit rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:block">
        <NuhmeraLogo className="h-[17px] w-auto" decorative />
      </Link>
      <div className="col-start-2">
        <BuilderStepper
          stage={stage}
          readyEnabled={missing.length === 0}
          readyHint={describeMissing(missing, "first")}
          onSelect={onStage}
        />
      </div>
      <div className="col-start-3 flex items-center justify-end gap-1 sm:gap-2">
        <SaveStatus />
        <ThemeToggle className="text-muted-foreground hover:bg-muted hover:text-foreground" />
        <NewInvoiceButton exported={exported} onStarted={() => onStage("template")} />
      </div>
    </header>
  );
}
