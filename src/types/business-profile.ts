import type { CurrencyCode } from "@/config/currencies";

import type { AssetRef } from "./asset";
import type {
  BankTransferOption,
  Business,
  DocumentTax,
  PaymentLinkOption,
  PaymentTerms,
  QrCodeOption,
} from "./document";
import type { TemplateId } from "./template";

/**
 * Who is invoicing: the business identity and how it gets paid. Kept
 * separately from any one invoice so every new invoice starts with it.
 * Guests keep it in the browser; with accounts it becomes the business
 * record (decision 027).
 */
export interface BusinessProfile {
  business: Business;
  logo: AssetRef | null;
  bankTransfer: BankTransferOption;
  paymentLink: PaymentLinkOption;
  qrCode: QrCodeOption;
  /** How the last invoice was set up, reused as the next one's starting point. */
  defaults: {
    currency: CurrencyCode;
    templateId: TemplateId;
    brandColor: string | null;
    tax: DocumentTax;
    paymentTerms: PaymentTerms;
  };
}
