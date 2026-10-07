"use client";

import { Moon, Printer, Rows3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { DocumentRenderer } from "@/components/preview/document-renderer";
import { Button } from "@/components/ui/button";
import { createSampleDocument } from "@/data/sample-document";
import { cn } from "@/lib/utils";

export function DocumentSandbox() {
  // ?long opens the multi-page variant directly (useful for headless print checks).
  const searchParams = useSearchParams();
  const [long, setLong] = useState(() => searchParams.has("long"));
  const [dark, setDark] = useState(false);
  const document = createSampleDocument({ repeat: long ? 12 : 1 });

  return (
    <div className={cn("flex-1 bg-muted/50 print:bg-transparent", dark && "dark")}>
      <div className="flex min-h-full flex-col bg-background text-foreground print:bg-transparent">
        <div className="flex items-center gap-2 border-b px-4 py-3 print:hidden">
          <span className="mr-auto text-sm text-muted-foreground">Document sandbox</span>
          <Button variant="outline" size="sm" onClick={() => setLong(!long)}>
            <Rows3 /> {long ? "Short" : "Multi-page"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
            <Moon /> {dark ? "Light" : "Dark"} chrome
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer /> Print / Save as PDF
          </Button>
        </div>
        <div className="overflow-x-auto p-8 print:overflow-visible print:p-0">
          <div className="mx-auto w-fit ring-1 ring-black/5 print:w-auto print:ring-0">
            <DocumentRenderer document={document} />
          </div>
        </div>
      </div>
    </div>
  );
}
