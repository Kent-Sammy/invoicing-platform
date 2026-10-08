"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Route-level fallback for anything the builder's own boundaries don't catch. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-sm space-y-4 text-center">
        <h1 className="text-base font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">Please try again. Your saved work in this browser is safe.</p>
        <Button size="sm" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
