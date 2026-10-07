import type { BusinessDocument } from "@/types/document";

/**
 * Opens the browser's print dialog for the rendered document ("Save as PDF"),
 * once the document's fonts have loaded.
 * The page title becomes the suggested PDF file name, then is restored.
 */
export async function printDocument(document: BusinessDocument) {
  // Template fonts load on demand; never print before they're ready.
  await window.document.fonts.ready;
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
