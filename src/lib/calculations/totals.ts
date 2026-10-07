import { divideRounded, toSafeInteger, toScaled, type MinorUnits } from "@/lib/money";
import type {
  BusinessDocument,
  Discount,
  DocumentItem,
  Percentage,
  TaxMode,
} from "@/types/document";

// Quantities and percentages are converted to scaled integers before any
// arithmetic, so every result is exact until the single rounding step.
const QUANTITY_DECIMALS = 4;
const PERCENT_DECIMALS = 4;
const QUANTITY_SCALE = 10n ** BigInt(QUANTITY_DECIMALS);
// 100% expressed at the same scale as a scaled rate.
const HUNDRED_PERCENT = 100n * 10n ** BigInt(PERCENT_DECIMALS);

export interface TaxLine {
  label: string;
  rate: Percentage;
  mode: TaxMode;
  /** The net amount the tax is calculated on. */
  taxableAmount: MinorUnits;
  amount: MinorUnits;
}

export interface DocumentTotals {
  /** Rounded line totals, keyed by item id. */
  lineTotals: Record<string, MinorUnits>;
  /** Sum of line totals. Includes tax when prices are tax-inclusive. */
  subtotal: MinorUnits;
  discount: MinorUnits;
  /** Subtotal after discount. */
  discountedSubtotal: MinorUnits;
  /** Total excluding tax. */
  net: MinorUnits;
  /** One entry per tax applied. A list so line-level or multiple taxes fit later. */
  taxes: TaxLine[];
  taxTotal: MinorUnits;
  /** Amount payable. */
  total: MinorUnits;
}

/** Applies a percentage to an amount, rounded to the nearest minor unit. */
export function applyPercentage(amount: MinorUnits, rate: Percentage): MinorUnits {
  return toSafeInteger(
    divideRounded(BigInt(amount) * toScaled(rate, PERCENT_DECIMALS), HUNDRED_PERCENT),
  );
}

/** quantity × unit price, rounded to the nearest minor unit. */
export function calculateLineTotal(
  item: Pick<DocumentItem, "quantity" | "unitPrice">,
): MinorUnits {
  return toSafeInteger(
    divideRounded(
      toScaled(item.quantity, QUANTITY_DECIMALS) * BigInt(item.unitPrice),
      QUANTITY_SCALE,
    ),
  );
}

/** Sum of already-rounded line totals, so printed lines always add up. */
export function calculateSubtotal(lineTotals: readonly MinorUnits[]): MinorUnits {
  return toSafeInteger(lineTotals.reduce((sum, amount) => sum + BigInt(amount), 0n));
}

/** Discount amount, never negative and never more than the subtotal. */
export function calculateDiscount(subtotal: MinorUnits, discount: Discount | null): MinorUnits {
  if (!discount || subtotal <= 0) return 0;
  const amount =
    discount.type === "percentage"
      ? applyPercentage(subtotal, discount.value)
      : discount.amount;
  return Math.min(Math.max(amount, 0), subtotal);
}

/** Tax added on top of a net amount: 100,000 at 7.5% → 7,500. */
export function calculateTax(netAmount: MinorUnits, rate: Percentage): MinorUnits {
  return applyPercentage(netAmount, rate);
}

/** Tax contained in a tax-inclusive amount: 107,500 at 7.5% → 7,500. */
export function calculateIncludedTax(grossAmount: MinorUnits, rate: Percentage): MinorUnits {
  const scaledRate = toScaled(rate, PERCENT_DECIMALS);
  if (scaledRate === 0n) return 0;
  return toSafeInteger(
    divideRounded(BigInt(grossAmount) * scaledRate, HUNDRED_PERCENT + scaledRate),
  );
}

/**
 * Totals for a document. Discounts apply to the subtotal as entered (net in
 * exclusive mode, gross in inclusive mode); tax is then rounded once.
 */
export function calculateTotals(
  document: Pick<BusinessDocument, "items" | "discount" | "tax">,
): DocumentTotals {
  const lineTotals: Record<string, MinorUnits> = {};
  for (const item of document.items) {
    lineTotals[item.id] = calculateLineTotal(item);
  }

  const subtotal = calculateSubtotal(Object.values(lineTotals));
  const discount = calculateDiscount(subtotal, document.discount);
  const discountedSubtotal = subtotal - discount;

  const { tax } = document;
  if (!tax.enabled) {
    return {
      lineTotals,
      subtotal,
      discount,
      discountedSubtotal,
      net: discountedSubtotal,
      taxes: [],
      taxTotal: 0,
      total: discountedSubtotal,
    };
  }

  // Exclusive: tax goes on top. Inclusive: tax is extracted, the total is unchanged.
  const inclusive = tax.mode === "inclusive";
  const taxAmount = inclusive
    ? calculateIncludedTax(discountedSubtotal, tax.rate)
    : calculateTax(discountedSubtotal, tax.rate);
  const net = inclusive ? discountedSubtotal - taxAmount : discountedSubtotal;

  return {
    lineTotals,
    subtotal,
    discount,
    discountedSubtotal,
    net,
    taxes: [{ label: tax.label, rate: tax.rate, mode: tax.mode, taxableAmount: net, amount: taxAmount }],
    taxTotal: taxAmount,
    total: toSafeInteger(BigInt(net) + BigInt(taxAmount)),
  };
}
