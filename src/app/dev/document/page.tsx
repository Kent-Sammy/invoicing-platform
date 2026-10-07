import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DocumentSandbox } from "./document-sandbox";

// Development-only sandbox for checking the renderer, print output and
// paper-vs-theme behaviour. Not part of the product.
export default function DevDocumentPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense>
      <DocumentSandbox />
    </Suspense>
  );
}
