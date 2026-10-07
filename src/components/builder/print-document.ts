import type { BusinessDocument } from "@/types/document";

/**
 * Opens the browser's print dialog for the rendered document ("Save as PDF").
 * The page title becomes the suggested PDF file name, then is restored.
 */
export function printDocument(document: BusinessDocument) {
  const name = [document.number, document.business.name].filter(Boolean).join(" – ");
  const previous = window.document.title;
  window.document.title = name || previous;
  window.addEventListener(
    "afterprint",
    () => {
      window.document.title = previous;
    },
    { once: true },
  );
  window.print();
}
