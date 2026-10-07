import type { ReactNode } from "react";

import type { Party } from "@/types/document";

import type { TemplateProps } from "../types";

// Structural placeholder: proves the data → view → template → print pipeline.
// The Minimal template's real visual design is built in the template phase.

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-doc-ink-muted text-[8pt] uppercase tracking-wide">{children}</p>;
}

function PartyBlock({ label, party }: { label: string; party: Party }) {
  return (
    <div className="space-y-0.5">
      <Eyebrow>{label}</Eyebrow>
      <p className="font-medium">{party.name}</p>
      <p className="text-doc-ink-muted whitespace-pre-line">{party.address}</p>
      <p className="text-doc-ink-muted">{party.email}</p>
      <p className="text-doc-ink-muted">{party.phone}</p>
      {party.taxId && <p className="text-doc-ink-muted">{party.taxId}</p>}
    </div>
  );
}

export function MinimalTemplate({ view }: TemplateProps) {
  const { labels } = view;

  return (
    <div className="space-y-10 text-[9.5pt] leading-relaxed">
      <header className="flex items-start justify-between gap-8">
        <div>
          {view.branding.logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- locally stored data URL
            <img src={view.branding.logoSrc} alt="" className="mb-4 max-h-12 w-auto" />
          )}
          <h1 className="text-doc-brand text-[20pt] font-semibold">{view.title}</h1>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-0.5 text-right">
          <dt className="text-doc-ink-muted">{labels.number}</dt>
          <dd>{view.number}</dd>
          <dt className="text-doc-ink-muted">{labels.issueDate}</dt>
          <dd>{view.issueDate}</dd>
          <dt className="text-doc-ink-muted">{labels.dueDate}</dt>
          <dd>{view.dueDate}</dd>
        </dl>
      </header>

      <section className="grid grid-cols-2 gap-8">
        <PartyBlock label={labels.from} party={view.business} />
        <PartyBlock label={labels.to} party={view.client} />
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-doc-rule text-doc-ink-muted border-b text-left">
            <th className="py-2 font-normal">{labels.description}</th>
            <th className="py-2 pl-4 text-right font-normal">{labels.quantity}</th>
            <th className="py-2 pl-4 text-right font-normal">{labels.unitPrice}</th>
            <th className="py-2 pl-4 text-right font-normal">{labels.amount}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {view.items.map((item) => (
            <tr key={item.id} className="border-doc-rule border-b">
              <td className="py-2 pr-4 whitespace-pre-line">{item.description}</td>
              <td className="py-2 pl-4 text-right">{item.quantity}</td>
              <td className="py-2 pl-4 text-right">{item.unitPrice}</td>
              <td className="py-2 pl-4 text-right">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="document-keep-together ml-auto w-64 space-y-3 tabular-nums">
        <dl className="grid grid-cols-[1fr_auto] gap-y-1">
          {view.summary.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-doc-ink-muted">{row.label}</dt>
              <dd className="text-right">{row.amount}</dd>
            </div>
          ))}
          <dt className="border-doc-rule mt-1 border-t pt-2 font-semibold">{view.total.label}</dt>
          <dd className="border-doc-rule mt-1 border-t pt-2 text-right font-semibold">
            {view.total.amount}
          </dd>
        </dl>
        {view.taxBreakdown && (
          <dl className="text-doc-ink-muted grid grid-cols-[1fr_auto] gap-y-0.5 text-[8.5pt]">
            <dt className="col-span-2">{view.taxBreakdown.note}</dt>
            {view.taxBreakdown.lines.map((row) => (
              <div key={row.label} className="contents">
                <dt>{row.label}</dt>
                <dd className="text-right">{row.amount}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {view.paymentDetails && (
        <section className="document-keep-together space-y-1">
          <Eyebrow>{view.paymentDetails.title}</Eyebrow>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5">
            {view.paymentDetails.fields.map((field) => (
              <div key={field.label} className="contents">
                <dt className="text-doc-ink-muted">{field.label}</dt>
                <dd className="tabular-nums">{field.value}</dd>
              </div>
            ))}
          </dl>
          {view.paymentDetails.instructions && (
            <p className="whitespace-pre-line">{view.paymentDetails.instructions}</p>
          )}
        </section>
      )}

      {(view.notes || view.terms) && (
        <footer className="document-keep-together grid grid-cols-2 gap-8">
          {view.notes && (
            <div>
              <Eyebrow>{labels.notes}</Eyebrow>
              <p className="whitespace-pre-line">{view.notes}</p>
            </div>
          )}
          {view.terms && (
            <div>
              <Eyebrow>{labels.terms}</Eyebrow>
              <p className="whitespace-pre-line">{view.terms}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
