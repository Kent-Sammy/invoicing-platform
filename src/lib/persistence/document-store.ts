import type { BusinessDocument } from "@/types/document";

/**
 * Where the current draft document is kept. The builder depends only on this
 * interface, so guest localStorage can later be swapped for a database.
 * Async from the start because remote storage will be.
 */
export interface DocumentStore {
  load(): Promise<BusinessDocument | null>;
  save(document: BusinessDocument): Promise<void>;
  clear(): Promise<void>;
}
