import { dueDateFor } from "@/lib/documents";
import type { BusinessProfile } from "@/types/business-profile";
import type { BusinessDocument } from "@/types/document";

/** The business-level part of a document: what carries over to the next invoice. */
export function profileFromDocument(document: BusinessDocument): BusinessProfile {
  const { business, paymentOptions, branding } = document;
  return {
    business,
    logo: branding.logo,
    bankTransfer: paymentOptions.bankTransfer,
    paymentLink: paymentOptions.paymentLink,
    qrCode: paymentOptions.qrCode,
    defaults: {
      currency: document.currency,
      templateId: branding.templateId,
      brandColor: branding.brandColor,
      tax: document.tax,
      paymentTerms: document.paymentTerms,
    },
  };
}

/**
 * Starts a fresh document from a business profile: identity, payment
 * details and defaults come from the profile; client, items, notes and
 * dates stay as new.
 */
export function applyBusinessProfile(
  document: BusinessDocument,
  profile: BusinessProfile,
): BusinessDocument {
  const { defaults } = profile;
  return {
    ...document,
    currency: defaults.currency,
    paymentTerms: defaults.paymentTerms,
    dueDate: dueDateFor(document.issueDate, defaults.paymentTerms) ?? document.dueDate,
    business: profile.business,
    tax: defaults.tax,
    paymentOptions: {
      bankTransfer: profile.bankTransfer,
      paymentLink: profile.paymentLink,
      qrCode: profile.qrCode,
    },
    branding: {
      templateId: defaults.templateId,
      brandColor: defaults.brandColor,
      logo: profile.logo,
    },
  };
}
