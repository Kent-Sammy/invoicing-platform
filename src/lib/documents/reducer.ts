import type {
  BusinessDocument,
  DocumentBranding,
  DocumentItem,
  DocumentTax,
  Party,
} from "@/types/document";

type DocumentFields = Omit<
  BusinessDocument,
  "id" | "type" | "business" | "client" | "items" | "tax" | "branding"
>;

export type DocumentAction =
  | { type: "replace"; document: BusinessDocument }
  | { type: "update"; changes: Partial<DocumentFields> }
  | { type: "updateBusiness"; changes: Partial<Party> }
  | { type: "updateClient"; changes: Partial<Party> }
  | { type: "updateTax"; changes: Partial<DocumentTax> }
  | { type: "updateBranding"; changes: Partial<DocumentBranding> }
  | { type: "addItem"; item: DocumentItem }
  | { type: "updateItem"; id: string; changes: Partial<Omit<DocumentItem, "id">> }
  | { type: "removeItem"; id: string };

/** Pure state transitions for the document being edited. */
export function documentReducer(
  document: BusinessDocument,
  action: DocumentAction,
): BusinessDocument {
  switch (action.type) {
    case "replace":
      return action.document;
    case "update":
      return { ...document, ...action.changes };
    case "updateBusiness":
      return { ...document, business: { ...document.business, ...action.changes } };
    case "updateClient":
      return { ...document, client: { ...document.client, ...action.changes } };
    case "updateTax":
      return { ...document, tax: { ...document.tax, ...action.changes } };
    case "updateBranding":
      return { ...document, branding: { ...document.branding, ...action.changes } };
    case "addItem":
      return { ...document, items: [...document.items, action.item] };
    case "updateItem":
      return {
        ...document,
        items: document.items.map((item) =>
          item.id === action.id ? { ...item, ...action.changes } : item,
        ),
      };
    case "removeItem":
      return { ...document, items: document.items.filter((item) => item.id !== action.id) };
  }
}
