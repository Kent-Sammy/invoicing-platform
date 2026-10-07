"use client";

import { useDocument } from "@/components/document/document-provider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/types/document";

import { Disclosures, EditorSection, Field } from "./editor-section";

export function ClientSection() {
  const { document, dispatch } = useDocument();
  const client = document.client;
  const update = (changes: Partial<Client>) => dispatch({ type: "updateClient", changes });

  return (
    <EditorSection title="Client">
      <Field label="Client or company name" htmlFor="client-name">
        <Input
          id="client-name"
          value={client.name}
          onChange={(event) => update({ name: event.target.value })}
          placeholder="Who is this invoice for?"
        />
      </Field>
      <Field label="Email" htmlFor="client-email">
        <Input
          id="client-email"
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
                <Field label="Address" htmlFor="client-address">
                  <Textarea
                    id="client-address"
                    value={client.address}
                    onChange={(event) => update({ address: event.target.value })}
                    placeholder={"Street\nCity"}
                    rows={2}
                    className="min-h-0 resize-none"
                  />
                </Field>
                <Field label="Phone" htmlFor="client-phone">
                  <Input
                    id="client-phone"
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
              <Field label="Client tax ID" htmlFor="client-tax-id">
                <Input
                  id="client-tax-id"
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
