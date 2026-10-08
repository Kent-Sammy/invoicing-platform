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
    paymentOptions: {
      bankTransfer: {
        enabled: true,
        bankName: "GTBank",
        accountName: "Studio Adebayo Ltd",
        accountNumber: "0123456789",
        instructions: "Please use the invoice number as the payment reference.",
      },
      paymentLink: { enabled: true, url: "https://paystack.com/pay/studio-adebayo", showButton: true },
      qrCode: { enabled: true },
    },
    notes: "Thank you for your business.",
    terms: "Payment due within 14 days.",
    branding: { templateId: "minimal", brandColor: "#4f46e5", logo: null },
  };
}

/**
 * Worst-case but realistic content: long names, long unbroken emails and
 * URLs, an unbroken word, multi-line items and the largest allowed amounts.
 * Every template must keep all of it inside the A4 page.
 */
export function createStressDocument(options: SampleOptions = {}): BusinessDocument {
  const sample = createSampleDocument(options);
  return {
    ...sample,
    number: "INV-2026-000123-LAGOS-HQ-PROCUREMENT",
    business: {
      ...sample.business,
      name: "Adebayo Okonkwo-Fashola Creative Design & Brand Strategy Studio Limited",
      email: "accounts.receivable.department@adebayookonkwofasholacreativestudio.com.ng",
      address: "Plot 1234, Admiralty Way, Lekki Phase 1, Eti-Osa Local Government Area\nLagos",
      taxId: "TIN 12345678-0001 / RC 1234567 / VAT-NG-0000000001",
    },
    client: {
      ...sample.client,
      name: "Federal Ministry of Information and National Orientation Procurement Unit",
      email: "procurement.unit.headquarters.abuja@ministryofinformationandculture.gov.ng",
      phone: "+234 809 000 0000",
      address: "Radio House, Herbert Macaulay Way, Area 10, Garki\nAbuja FCT",
    },
    items: [
      {
        id: "stress-0",
        description:
          "Comprehensive brand identity system\nPrimary and secondary logos, colour palette, typography, iconography and a 60-page brand book",
        quantity: 1,
        unitPrice: 99_999_999_999_999,
      },
      {
        id: "stress-1",
        description: "Supercalifragilisticexpialidociousunbrokenreferencecodethatgoesonwithoutanyspaces",
        quantity: 999_999.5,
        unitPrice: 9_999,
      },
      ...sample.items.slice(0, 2),
    ],
    notes: "Reference: https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789",
    paymentOptions: {
      ...sample.paymentOptions,
      bankTransfer: {
        ...sample.paymentOptions.bankTransfer,
        bankName: "Guaranty Trust Bank Plc (GTCO)",
        accountName: "Adebayo Okonkwo-Fashola Creative Design Studio Limited",
      },
      paymentLink: {
        ...sample.paymentOptions.paymentLink,
        url: "https://paystack.com/pay/adebayo-okonkwo-fashola-creative-design-studio-invoice-2026-000123",
      },
    },
  };
}
