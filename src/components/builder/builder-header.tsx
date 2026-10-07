"use client";

import { AlertCircle, Check, Download, FilePlus2 } from "lucide-react";

import { useDocument } from "@/components/document/document-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

import { printDocument } from "./print-document";

function SaveStatus() {
  const { saveStatus } = useDocument();
  if (saveStatus === "error") {
    return (
      <span className="flex items-center gap-1.5 text-[12.5px] text-destructive">
        <AlertCircle className="size-3.5" /> Not saved
      </span>
    );
  }
  if (saveStatus === "saved") {
    return (
      <span className="hidden items-center gap-1.5 text-[12.5px] text-muted-foreground sm:flex">
        <Check className="size-3.5" /> Saved in this browser
      </span>
    );
  }
  return null;
}

function NewInvoiceButton() {
  const { reset } = useDocument();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="New invoice">
          <FilePlus2 />
          <span className="hidden sm:inline">New</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start a new invoice?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears the current invoice from this browser. Download it first if you need a copy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => reset()}>Start new</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DownloadButton({ className }: { className?: string }) {
  const { document } = useDocument();
  return (
    <Button size="sm" onClick={() => printDocument(document)} className={className}>
      <Download />
      <span className="sm:hidden">PDF</span>
      <span className="hidden sm:inline">Download PDF</span>
    </Button>
  );
}

export function BuilderHeader() {
  const { document } = useDocument();
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4 print:hidden">
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <span className="font-semibold tracking-tight">{siteConfig.name}</span>
        <span className="text-muted-foreground/60">/</span>
        <span className="truncate text-muted-foreground tabular-nums">{document.number || "Untitled"}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <SaveStatus />
        <NewInvoiceButton />
        <DownloadButton />
      </div>
    </header>
  );
}
