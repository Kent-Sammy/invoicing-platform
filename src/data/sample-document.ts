import type { BusinessDocument, DocumentItem } from "@/types/document";

const SAMPLE_ITEMS: Omit<DocumentItem, "id">[] = [
  { description: "Brand identity design", quantity: 1, unitPrice: 75_000_000 },
  { description: "Website design — 6 pages", quantity: 6, unitPrice: 8_500_000 },
  { description: "Front-end development (hours)", quantity: 32.5, unitPrice: 1_250_000 },
  { description: "Stock photography licence", quantity: 3, unitPrice: 1_999_950 },
];

/**
 * Fixed, deterministic sample for development and visual checks.
 * `repeat` duplicates the line items to exercise multi-page printing.
 */
export function createSampleDocument({ repeat = 1 } = {}): BusinessDocument {
  const items = Array.from({ length: repeat }, (_, round) =>
    SAMPLE_ITEMS.map((item, index) => ({ ...item, id: `sample-${round}-${index}` })),
  ).flat();

  return {
    id: "sample",
    type: "invoice",
    number: "INV-0042",
    issueDate: "2026-10-07",
    dueDate: "2026-10-21",
    currency: "NGN",
    business: {
      name: "Studio Adebayo Ltd",
      email: "hello@studioadebayo.ng",
      phone: "+234 801 234 5678",
      address: "14 Admiralty Way\nLekki Phase 1, Lagos",
      taxId: "TIN 12345678-0001",
    },
    client: {
      name: "Harbour & Co.",
      email: "accounts@harbour.co",
      phone: "",
      address: "3 Marina Road\nLagos Island, Lagos",
      taxId: "",
    },
    items,
    discount: { type: "percentage", value: 10 },
    tax: { enabled: true, label: "VAT", rate: 7.5 },
    notes: "Thank you for your business.",
    terms: "Payment due within 14 days.",
    branding: { templateId: "minimal", brandColor: "#4f46e5", logo: null },
  };
}
