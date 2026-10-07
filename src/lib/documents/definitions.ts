import type { DocumentType } from "@/types/document";

/** Everything that differs between document types, expressed as configuration. */
export interface DocumentTypeDefinition {
  type: DocumentType;
  title: string;
  numberPrefix: string;
  labels: {
    number: string;
    issueDate: string;
    dueDate: string;
    from: string;
    to: string;
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
    subtotal: string;
    discount: string;
    total: string;
    notes: string;
    terms: string;
  };
}

export const DOCUMENT_TYPES: Record<DocumentType, DocumentTypeDefinition> = {
  invoice: {
    type: "invoice",
    title: "Invoice",
    numberPrefix: "INV-",
    labels: {
      number: "Invoice no.",
      issueDate: "Issue date",
      dueDate: "Due date",
      from: "From",
      to: "Bill to",
      description: "Description",
      quantity: "Qty",
      unitPrice: "Price",
      amount: "Amount",
      subtotal: "Subtotal",
      discount: "Discount",
      total: "Total",
      notes: "Notes",
      terms: "Terms",
    },
  },
};

export function getDocumentType(type: DocumentType): DocumentTypeDefinition {
  return DOCUMENT_TYPES[type];
}
