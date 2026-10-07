import { addDays, isISODate } from "@/lib/dates";
import type { ISODate, PaymentTerms } from "@/types/document";

/**
 * The due date implied by payment terms, or null when there is none to
 * derive: custom terms (the user's chosen date stands) or an invalid issue date.
 */
export function dueDateFor(issueDate: ISODate, terms: PaymentTerms): ISODate | null {
  if (!isISODate(issueDate)) return null;
  switch (terms.type) {
    case "on_receipt":
      return issueDate;
    case "net":
      return addDays(issueDate, terms.days);
    case "custom":
      return null;
  }
}
