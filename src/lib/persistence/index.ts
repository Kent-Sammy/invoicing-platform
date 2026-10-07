export type { DocumentStore } from "./document-store";
export { createLocalStorageDocumentStore, GUEST_DRAFT_KEY } from "./local-storage-store";
export { migrateDocument, SCHEMA_VERSION } from "./migrations";
