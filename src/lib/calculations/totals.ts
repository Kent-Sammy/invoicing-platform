import { divideRounded, toSafeInteger, toScaled, type MinorUnits } from "@/lib/money";
import type {
  BusinessDocument,
  Discount,
  DocumentItem,
  Percentage,
} from "@/types/document";

// Quantities and percentages are converted to scaled integers before any
// arithmetic, so every result is exact until the single rounding step.
const QUANTITY_DECIMALS = 4;
const PERCENT_DECIMALS = 4;
const QUANTITY_SCALE = 10n ** BigInt(QUANTITY_DECIMALS);
// Divides out both the percent (÷100) and the scaling of the rate.
const PERCENT_DIVISOR = 100n * 10n ** BigInt(PERCENT_DECIMALS);

export interface TaxLine {
  label: string;
  rate: Percentage;
  taxableAmount: MinorUnits;
  amount: MinorUnits;
}

export interface DocumentTotals {
  /** Rounded line totals, keyed by item id. */
  lineTotals: Record<string, MinorUnits>;
  subtotal: MinorUnits;
  discount: MinorUnits;
  /** Subtotal after discount — the base tax is calculated on. */
  taxableSubtotal: MinorUnits;
  /** One entry per tax applied. A list so line-level or multiple taxes fit later. */
  taxes: TaxLine[];
  taxTotal: MinorUnits;
  total: MinorUnits;
}

/** Applies a percentage to an amount, rounded to the nearest minor unit. */
export function applyPercentage(amount: MinorUnits, rate: Percentage): MinorUnits {
  return toSafeInteger(
    divideRounded(BigInt(amount) * toScaled(rate, PERCENT_DECIMALS), PERCENT_DIVISOR),
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

/** Tax on a taxable amount, rounded once to the currency's minor unit. */
export function calculateTax(taxableAmount: MinorUnits, rate: Percentage): MinorUnits {
  return applyPercentage(taxableAmount, rate);
}

export function calculateTotals(
  document: Pick<BusinessDocument, "items" | "discount" | "tax">,
): DocumentTotals {
  const lineTotals: Record<string, MinorUnits> = {};
  for (const item of document.items) {
    lineTotals[item.id] = calculateLineTotal(item);
  }

  const subtotal = calculateSubtotal(Object.values(lineTotals));
  const discount = calculateDiscount(subtotal, document.discount);
  const taxableSubtotal = subtotal - discount;

  const taxes: TaxLine[] = document.tax.enabled
    ? [
        {
          label: document.tax.label,
          rate: document.tax.rate,
          taxableAmount: taxableSubtotal,
          amount: calculateTax(taxableSubtotal, document.tax.rate),
        },
      ]
    : [];
  const taxTotal = calculateSubtotal(taxes.map((tax) => tax.amount));

  return {
    lineTotals,
    subtotal,
    discount,
    taxableSubtotal,
    taxes,
    taxTotal,
    total: toSafeInteger(BigInt(taxableSubtotal) + BigInt(taxTotal)),
  };
}
