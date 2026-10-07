import { calculateTotals, type DocumentTotals } from "@/lib/calculations";
import { formatISODate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { createQrCode, displayPaymentUrl, normalizePaymentUrl, type QrCode } from "@/lib/payments";
import type { BusinessDocument, Party } from "@/types/document";

import { getDocumentType, type DocumentTypeDefinition } from "./definitions";
import type { PlaceholderField } from "./placeholders";

export interface DocumentViewItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

export interface DocumentViewAmount {
  label: string;
  amount: string;
}

/** A resolved logo image with its intrinsic size (for aspect-aware layout). */
export interface DocumentLogo {
  src: string;
  width: number;
  height: number;
}

export interface DocumentViewField {
  label: string;
  value: string;
}

export interface DocumentViewPayment {
  title: string;
  bankTransfer: { title: string; fields: DocumentViewField[]; instructions: string } | null;
  /** "Pay invoice" call to action. */
  link: { url: string; label: string; display: string } | null;
  /** QR code of the payment link, for printed copies. */
  qr: { code: QrCode; caption: string; display: string } | null;
}

/**
 * Display-ready version of a document: every amount, date and label is
 * already calculated and formatted. Templates render this and nothing else,
 * so no template can drift from the calculation engine.
 */
export interface DocumentView {
  title: string;
  labels: DocumentTypeDefinition["labels"];
  number: string;
  issueDate: string;
  dueDate: string;
  business: Party;
  client: Party;
  items: DocumentViewItem[];
  /** Rows above the total, in order: subtotal, discount, and (exclusive mode) taxes. */
  summary: DocumentViewAmount[];
  total: DocumentViewAmount;
  /** Tax-inclusive mode only: "VAT (7.5%) included" with net and tax amounts. */
  taxBreakdown: { note: string; lines: DocumentViewAmount[] } | null;
  /** Null when no payment option is enabled and filled in. */
  payment: DocumentViewPayment | null;
  notes: string;
  terms: string;
  branding: { brandColor: string; logo: DocumentLogo | null };
  /** Fields showing sample content; templates mark them, print omits them. */
  placeholders: ReadonlySet<PlaceholderField>;
}

interface DocumentViewOptions {
  totals?: DocumentTotals;
  /** Resolved logo image (the document stores only a reference). */
  logo?: DocumentLogo | null;
  placeholders?: ReadonlySet<PlaceholderField>;
}

const NO_PLACEHOLDERS: ReadonlySet<PlaceholderField> = new Set();

export function createDocumentView(
  document: BusinessDocument,
  {
    totals = calculateTotals(document),
    logo = null,
    placeholders = NO_PLACEHOLDERS,
  }: DocumentViewOptions = {},
): DocumentView {
  const { labels, title } = getDocumentType(document.type);
  // Dates and plain numbers follow the business locale; money follows the currency.
  const { locale } = document.business;
  const money = (amount: number) => formatMoney(amount, document.currency);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  const percent = (rate: number) => `${number.format(rate)}%`;

  const summary: DocumentViewAmount[] = [{ label: labels.subtotal, amount: money(totals.subtotal) }];
  if (totals.discount > 0) {
    const discount = document.discount;
    summary.push({
      label:
        discount?.type === "percentage"
          ? `${labels.discount} (${percent(discount.value)})`
          : labels.discount,
      amount: `−${money(totals.discount)}`,
    });
  }

  let taxBreakdown: DocumentView["taxBreakdown"] = null;
  for (const tax of totals.taxes) {
    const label = `${tax.label} (${percent(tax.rate)})`;
    if (tax.mode === "exclusive") {
      summary.push({ label, amount: money(tax.amount) });
    } else {
      taxBreakdown = {
        note: `${label} ${labels.taxIncluded}`,
        lines: [
          { label: labels.net, amount: money(totals.net) },
          { label: tax.label, amount: money(tax.amount) },
        ],
      };
    }
  }

  const payment = createPaymentView(document, labels);

  return {
    title,
    labels,
    number: document.number,
    issueDate: formatISODate(document.issueDate, locale),
    dueDate: formatISODate(document.dueDate, locale),
    business: document.business,
    client: document.client,
    items: document.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: number.format(item.quantity),
      unitPrice: money(item.unitPrice),
      amount: money(totals.lineTotals[item.id] ?? 0),
    })),
    summary,
    total: { label: labels.total, amount: money(totals.total) },
    taxBreakdown,
    payment,
    notes: document.notes,
    terms: document.terms,
    branding: { brandColor: document.branding.brandColor, logo },
    placeholders,
  };
}

function createPaymentView(
  document: BusinessDocument,
  labels: DocumentTypeDefinition["labels"],
): DocumentViewPayment | null {
  const { bankTransfer, paymentLink, qrCode } = document.paymentOptions;

  const fields = [
    { label: labels.bankName, value: bankTransfer.bankName },
    { label: labels.accountName, value: bankTransfer.accountName },
    { label: labels.accountNumber, value: bankTransfer.accountNumber },
  ].filter((field) => field.value.trim() !== "");
  const bank =
    bankTransfer.enabled && (fields.length > 0 || bankTransfer.instructions.trim() !== "")
      ? { title: labels.bankTransfer, fields, instructions: bankTransfer.instructions }
      : null;

  // Only a valid http(s) URL ever becomes a link or a QR code.
  const url = paymentLink.enabled ? normalizePaymentUrl(paymentLink.url) : null;
  const display = url ? displayPaymentUrl(url) : "";
  const link = url && paymentLink.showButton ? { url, label: labels.payInvoice, display } : null;
  const qr = url && qrCode.enabled ? { code: createQrCode(url), caption: labels.scanToPay, display } : null;

  return bank || link || qr ? { title: labels.payment, bankTransfer: bank, link, qr } : null;
}
