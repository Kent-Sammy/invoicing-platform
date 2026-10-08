"use client";

import { ErrorBoundary } from "@/components/error-boundary";

import { DocumentRenderer, type DocumentRendererProps } from "./document-renderer";

/**
 * DocumentRenderer inside an error boundary. If the document can't be
 * rendered, a calm notice takes the page's place and the rest of the app
 * keeps working; the next edit retries automatically.
 */
export function SafeDocumentRenderer(props: DocumentRendererProps) {
  return (
    <ErrorBoundary
      resetKey={props.document}
      fallback={(retry) => (
        <div
          role="alert"
          className="flex aspect-[210/297] w-[210mm] flex-col items-center justify-center gap-3 bg-white p-[18mm] text-center text-[11pt] text-zinc-600"
        >
          <p className="font-medium text-zinc-900">This invoice couldn&apos;t be displayed.</p>
          <p>Your changes are saved. Undo your last edit, or try again.</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-900 hover:bg-zinc-50"
          >
            Try again
          </button>
        </div>
      )}
    >
      <DocumentRenderer {...props} />
    </ErrorBoundary>
  );
}
