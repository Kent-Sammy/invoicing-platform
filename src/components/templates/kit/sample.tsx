import type { DocumentView, PlaceholderField } from "@/lib/documents";

interface SampleTextProps {
  view: DocumentView;
  field: PlaceholderField;
  value: string;
  className?: string;
}

/**
 * A line of document text that may be sample content. Sample content is
 * marked (`data-placeholder`) so it is styled on screen and never printed.
 * Renders nothing for empty values.
 */
export function SampleText({ view, field, value, className }: SampleTextProps) {
  if (!value) return null;
  return (
    <p className={className} data-placeholder={view.placeholders.has(field) || undefined}>
      {value}
    </p>
  );
}

/**
 * Whether a whole party block is sample content — then the block, label
 * included, should disappear from print.
 */
export function isSampleParty(view: DocumentView, party: "business" | "client"): boolean {
  const data = view[party];
  return (
    view.placeholders.has(`${party}.name`) &&
    view.placeholders.has(`${party}.email`) &&
    !data.taxId &&
    (party === "business" || !data.phone)
  );
}
