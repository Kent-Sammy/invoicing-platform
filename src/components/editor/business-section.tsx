"use client";

import { useState } from "react";

import { useDocument } from "@/components/document/document-provider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, isCountryCode } from "@/config/countries";
import type { Business } from "@/types/document";

import { Disclosures, EditorSection, Field, FieldRow } from "./editor-section";
import { LogoField } from "./logo-field";

export function BusinessSection() {
  const { document, dispatch } = useDocument();
  const business = document.business;
  const update = (changes: Partial<Business>) => dispatch({ type: "updateBusiness", changes });
  const [logoError, setLogoError] = useState<string | null>(null);

  return (
    <EditorSection title="Your business">
      <div className="space-y-1.5">
        <label htmlFor="business-name" className="text-[12px] text-muted-foreground">
          Logo & business name
        </label>
        <div className="flex items-center gap-2">
          <LogoField onError={setLogoError} />
          <Input
            id="business-name"
            value={business.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="Your business name"
            autoComplete="organization"
          />
        </div>
        {logoError && (
          <p role="alert" className="text-[11.5px] text-destructive">
            {logoError}
          </p>
        )}
      </div>
      <Disclosures
        groups={[
          {
            id: "contact",
            label: "Add contact details",
            defaultOpen: [business.email, business.phone, business.address].some(Boolean),
            content: (
              <>
                <FieldRow>
                  <Field label="Email" htmlFor="business-email">
                    <Input
                      id="business-email"
                      type="email"
                      value={business.email}
                      onChange={(event) => update({ email: event.target.value })}
                      placeholder="you@business.com"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Phone" htmlFor="business-phone">
                    <Input
                      id="business-phone"
                      type="tel"
                      value={business.phone}
                      onChange={(event) => update({ phone: event.target.value })}
                      placeholder="+234 800 000 0000"
                      autoComplete="tel"
                    />
                  </Field>
                </FieldRow>
                <Field label="Address" htmlFor="business-address">
                  <Textarea
                    id="business-address"
                    value={business.address}
                    onChange={(event) => update({ address: event.target.value })}
                    placeholder={"Street\nCity"}
                    rows={2}
                    className="min-h-0 resize-none"
                  />
                </Field>
                <Field label="Country" htmlFor="business-country" hint="Sets date format and tax suggestions.">
                  <Select
                    value={business.country}
                    onValueChange={(value) => isCountryCode(value) && update({ country: value })}
                  >
                    <SelectTrigger id="business-country" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(COUNTRIES).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </>
            ),
          },
          {
            id: "tax",
            label: "Add tax information",
            defaultOpen: business.taxId !== "",
            content: (
              <Field label="Tax ID" htmlFor="business-tax-id" hint="e.g. TIN or VAT number. Printed with your details.">
                <Input
                  id="business-tax-id"
                  value={business.taxId}
                  onChange={(event) => update({ taxId: event.target.value })}
                  placeholder="TIN 12345678-0001"
                />
              </Field>
            ),
          },
        ]}
      />
    </EditorSection>
  );
}
