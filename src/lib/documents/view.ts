import { calculateTotals, type DocumentTotals } from "@/lib/calculations";
import { formatISODate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { BusinessDocument, Party } from "@/types/document";

import { getDocumentType, type DocumentTypeDefinition } from "./definitions";

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

export interface DocumentViewField {
  label: string;
  value: string;
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
  /** Null when the user has not filled any payment details. */
  paymentDetails: { title: string; fields: DocumentViewField[]; instructions: string } | null;
  notes: string;
  terms: string;
  branding: { brandColor: string; logoSrc: string | null };
}

interface DocumentViewOptions {
  totals?: DocumentTotals;
  /** Resolved logo image (the document stores only a reference). */
  logoSrc?: string | null;
}

export function createDocumentView(
  document: BusinessDocument,
  { totals = calculateTotals(document), logoSrc = null }: DocumentViewOptions = {},
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

  const details = document.paymentDetails;
  const fields = [
    { label: labels.bankName, value: details.bankName },
    { label: labels.accountName, value: details.accountName },
    { label: labels.accountNumber, value: details.accountNumber },
  ].filter((field) => field.value.trim() !== "");
  const paymentDetails =
    fields.length > 0 || details.instructions.trim() !== ""
      ? { title: labels.paymentDetails, fields, instructions: details.instructions }
      : null;

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
    paymentDetails,
    notes: document.notes,
    terms: document.terms,
    branding: { brandColor: document.branding.brandColor, logoSrc },
  };
}
