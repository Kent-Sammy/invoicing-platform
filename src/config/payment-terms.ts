import type { PaymentTerms } from "@/types/document";

/** Default for new documents: due 14 days after the issue date. */
export const DEFAULT_PAYMENT_TERMS: PaymentTerms = { type: "net", days: 14 };

// Future presets (on receipt, 7, 30, 60 days, custom) are all expressible
// as PaymentTerms already; only the default is offered in v1.
