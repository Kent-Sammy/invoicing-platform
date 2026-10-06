import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

// Temporary placeholder until the invoice builder replaces this route.
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileText className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Foundation ready. The invoice builder will live here.
        </p>
        <Button variant="outline" disabled>
          Create invoice
        </Button>
      </div>
    </main>
  );
}
