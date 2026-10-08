"use client";

import { useDocument } from "@/components/document/document-provider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/types/document";

import { Disclosures, EditorSection, Field, useFieldId } from "./editor-section";

export function ClientSection() {
  const { document, dispatch } = useDocument();
  const client = document.client;
  const update = (changes: Partial<Client>) => dispatch({ type: "updateClient", changes });
  const fieldId = useFieldId();

  return (
    <EditorSection title="Client">
      <Field label="Client or company name" htmlFor={fieldId("client-name")}>
        <Input
          id={fieldId("client-name")}
          value={client.name}
          onChange={(event) => update({ name: event.target.value })}
          placeholder="Who is this invoice for?"
        />
      </Field>
      <Field label="Email" htmlFor={fieldId("client-email")}>
        <Input
          id={fieldId("client-email")}
          type="email"
          value={client.email}
          onChange={(event) => update({ email: event.target.value })}
          placeholder="client@company.com"
        />
      </Field>
      <Disclosures
        groups={[
          {
            id: "address",
            label: "Add address & phone",
            defaultOpen: client.address !== "" || client.phone !== "",
            content: (
              <>
                <Field label="Address" htmlFor={fieldId("client-address")}>
                  <Textarea
                    id={fieldId("client-address")}
                    value={client.address}
                    onChange={(event) => update({ address: event.target.value })}
                    placeholder={"Street\nCity"}
                    rows={2}
                    className="min-h-0 resize-none"
                  />
                </Field>
                <Field label="Phone" htmlFor={fieldId("client-phone")}>
                  <Input
                    id={fieldId("client-phone")}
                    type="tel"
                    value={client.phone}
                    onChange={(event) => update({ phone: event.target.value })}
                  />
                </Field>
              </>
            ),
          },
          {
            id: "tax",
            label: "Add tax information",
            defaultOpen: client.taxId !== "",
            content: (
              <Field label="Client tax ID" htmlFor={fieldId("client-tax-id")}>
                <Input
                  id={fieldId("client-tax-id")}
                  value={client.taxId}
                  onChange={(event) => update({ taxId: event.target.value })}
                />
              </Field>
            ),
          },
        ]}
      />
    </EditorSection>
  );
}
