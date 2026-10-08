import type { BusinessProfile } from "@/types/business-profile";

/**
 * Where the business profile lives. Separate from the invoice draft so it
 * maps one-to-one onto an account's business record later.
 */
export interface BusinessProfileStore {
  load(): Promise<BusinessProfile | null>;
  save(profile: BusinessProfile): Promise<void>;
}
