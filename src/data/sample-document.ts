import type { BusinessDocument, DocumentItem, TaxMode } from "@/types/document";

const SAMPLE_ITEMS: Omit<DocumentItem, "id">[] = [
  { description: "Brand identity design", quantity: 1, unitPrice: 75_000_000 },
  { description: "Website design — 6 pages", quantity: 6, unitPrice: 8_500_000 },
  { description: "Front-end development (hours)", quantity: 32.5, unitPrice: 1_250_000 },
  { description: "Stock photography licence", quantity: 3, unitPrice: 1_999_950 },
];

interface SampleOptions {
  /** Duplicates the line items to exercise multi-page printing. */
  repeat?: number;
  taxMode?: TaxMode;
}

/** Fixed, deterministic sample for development and visual checks. */
export function createSampleDocument({
  repeat = 1,
  taxMode = "exclusive",
}: SampleOptions = {}): BusinessDocument {
  const items = Array.from({ length: repeat }, (_, round) =>
    SAMPLE_ITEMS.map((item, index) => ({ ...item, id: `sample-${round}-${index}` })),
  ).flat();

  return {
    id: "sample",
    type: "invoice",
    number: "INV-0042",
    issueDate: "2026-10-07",
    dueDate: "2026-10-21",
    paymentTerms: { type: "net", days: 14 },
    currency: "NGN",
    business: {
      name: "Studio Adebayo Ltd",
      email: "hello@studioadebayo.ng",
      phone: "+234 801 234 5678",
      address: "14 Admiralty Way\nLekki Phase 1, Lagos",
      taxId: "TIN 12345678-0001",
      country: "NG",
      locale: "en-NG",
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
    tax: { enabled: true, label: "VAT", rate: 7.5, mode: taxMode },
    paymentDetails: {
      bankName: "GTBank",
      accountName: "Studio Adebayo Ltd",
      accountNumber: "0123456789",
      instructions: "Please use the invoice number as the payment reference.",
    },
    notes: "Thank you for your business.",
    terms: "Payment due within 14 days.",
    branding: { templateId: "minimal", brandColor: "#4f46e5", logo: null },
  };
}
