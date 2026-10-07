"use client";

import { useDocument } from "@/components/document/document-provider";
import { Textarea } from "@/components/ui/textarea";

import { Field, OptionalSection } from "./editor-section";

export function NotesSection() {
  const { document, dispatch } = useDocument();
  const update = (changes: { notes?: string; terms?: string }) =>
    dispatch({ type: "update", changes });

  return (
    <OptionalSection
      title="Notes"
      description="A thank-you note or payment terms."
      hasContent={document.notes !== "" || document.terms !== ""}
    >
      <Field label="Note" htmlFor="document-notes">
        <Textarea
          id="document-notes"
          value={document.notes}
          onChange={(event) => update({ notes: event.target.value })}
          placeholder="Thank you for your business."
          rows={2}
          className="min-h-0 resize-none"
        />
      </Field>
      <Field label="Terms" htmlFor="document-terms">
        <Textarea
          id="document-terms"
          value={document.terms}
          onChange={(event) => update({ terms: event.target.value })}
          placeholder="e.g. Payment due within 14 days."
          rows={2}
          className="min-h-0 resize-none"
        />
      </Field>
    </OptionalSection>
  );
}
