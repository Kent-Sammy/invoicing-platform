import { getCurrency } from "@/config/currencies";
import { calculateTotals, type DocumentTotals } from "@/lib/calculations";
import { formatISODate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { BusinessDocument, DocumentBranding, Party } from "@/types/document";

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
  dueDate: string | null;
  business: Party;
  client: Party;
  items: DocumentViewItem[];
  subtotal: string;
  discount: DocumentViewAmount | null;
  taxes: DocumentViewAmount[];
  total: string;
  notes: string;
  terms: string;
  branding: DocumentBranding;
}

function formatPercentage(rate: number, locale: string): string {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(rate)}%`;
}

export function createDocumentView(
  document: BusinessDocument,
  totals: DocumentTotals = calculateTotals(document),
): DocumentView {
  const definition = getDocumentType(document.type);
  const { locale } = getCurrency(document.currency);
  const money = (amount: number) => formatMoney(amount, document.currency);
  const quantity = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });

  const discount = document.discount;
  const discountLabel =
    discount?.type === "percentage"
      ? `${definition.labels.discount} (${formatPercentage(discount.value, locale)})`
      : definition.labels.discount;

  return {
    title: definition.title,
    labels: definition.labels,
    number: document.number,
    issueDate: formatISODate(document.issueDate, locale),
    dueDate: document.dueDate ? formatISODate(document.dueDate, locale) : null,
    business: document.business,
    client: document.client,
    items: document.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: quantity.format(item.quantity),
      unitPrice: money(item.unitPrice),
      amount: money(totals.lineTotals[item.id] ?? 0),
    })),
    subtotal: money(totals.subtotal),
    discount: totals.discount > 0 ? { label: discountLabel, amount: `−${money(totals.discount)}` } : null,
    taxes: totals.taxes.map((tax) => ({
      label: `${tax.label} (${formatPercentage(tax.rate, locale)})`,
      amount: money(tax.amount),
    })),
    total: money(totals.total),
    notes: document.notes,
    terms: document.terms,
    branding: document.branding,
  };
}
