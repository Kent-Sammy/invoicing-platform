import { createSampleDocument } from "@/data/sample-document";
import { createDocument } from "@/lib/documents";
import type { DocumentLogo } from "@/lib/documents";
import type { BusinessDocument } from "@/types/document";

export interface RenderFixture {
  name: string;
  document: BusinessDocument;
  logo?: DocumentLogo | null;
  showPlaceholders?: boolean;
}

const WIDE_LOGO: DocumentLogo = { src: "data:image/webp;base64,AA", width: 1200, height: 300 };
const SQUARE_LOGO: DocumentLogo = { src: "data:image/webp;base64,AA", width: 600, height: 600 };

/** The document variations every template must render correctly. */
export function renderFixtures(): RenderFixture[] {
  const sample = createSampleDocument();
  return [
    { name: "full sample", document: sample },
    { name: "inclusive tax", document: createSampleDocument({ taxMode: "inclusive" }) },
    { name: "multi-page", document: createSampleDocument({ repeat: 12 }) },
    { name: "wide logo", document: sample, logo: WIDE_LOGO },
    { name: "square logo", document: sample, logo: SQUARE_LOGO },
    {
      name: "no payment, no notes",
      document: {
        ...sample,
        notes: "",
        terms: "",
        paymentOptions: {
          ...sample.paymentOptions,
          bankTransfer: { ...sample.paymentOptions.bankTransfer, enabled: false },
          paymentLink: { ...sample.paymentOptions.paymentLink, enabled: false },
        },
      },
    },
    {
      name: "all placeholders",
      document: createDocument("invoice", { today: "2026-10-07" }),
      showPlaceholders: true,
    },
  ];
}
