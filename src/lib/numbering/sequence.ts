import type { DocumentType } from "@/types/document";

/**
 * Hands out the next document number for a document type. Guests use a
 * local counter; accounts will later use a server-controlled sequence per
 * business. The UI only ever sees this interface.
 */
export interface DocumentNumberSequence {
  next(type: DocumentType): Promise<string>;
}
