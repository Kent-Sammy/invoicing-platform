import type { ReactNode } from "react";

import type { DocumentView, DocumentViewPayment } from "@/lib/documents";

import { DefinitionRows, isSampleParty, LogoMark, PayLink, PaymentQr, SampleText as Line } from "../kit";
import type { TemplateProps } from "../types";

// Minimal: a quiet, typographic invoice. Sizes are in pt/mm so the screen
// preview and the printed A4 page match.

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-doc-ink-muted mb-[1.8mm] text-[7pt] font-medium tracking-[0.1em] uppercase">
      {children}
    </p>
  );
}

function PartyBlock({ view, party }: { view: DocumentView; party: "business" | "client" }) {
  const data = view[party];
  return (
    // An entirely sample block (label included) disappears from print.
    <div data-placeholder={isSampleParty(view, party) || undefined}>
      <Eyebrow>{party === "business" ? view.labels.from : view.labels.to}</Eyebrow>
      <Line view={view} field={`${party}.name`} value={data.name} className="text-[10pt] font-semibold" />
      <div className="text-doc-ink-muted mt-[0.8mm]">
        <Line view={view} field={`${party}.address`} value={data.address} className="whitespace-pre-line" />
        <Line view={view} field={`${party}.email`} value={data.email} />
        {party === "business" && <Line view={view} field="business.phone" value={data.phone} />}
        {party === "client" && data.phone && <p>{data.phone}</p>}
        {data.taxId && <p>{data.taxId}</p>}
      </div>
    </div>
  );
}

function Header({ view }: { view: DocumentView }) {
  const { logo } = view.branding;
  return (
    <header className="flex items-start justify-between gap-[10mm]">
      <div className="min-w-0 pt-[1mm]">
        {logo ? (
          <LogoMark logo={logo} />
        ) : (
          <Line
            view={view}
            field="business.name"
            value={view.business.name}
            className="text-[13pt] leading-tight font-semibold tracking-[-0.015em]"
          />
        )}
      </div>
      <div className="shrink-0 text-right">
        <h1 className="text-doc-brand text-[24pt] leading-none font-semibold tracking-[-0.03em]">
          {view.title}
        </h1>
        <p className="text-doc-ink-muted mt-[2.5mm] text-[9.5pt] tabular-nums">{view.number}</p>
      </div>
    </header>
  );
}

function Totals({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  return (
    <div className="document-keep-together mt-[5mm] ml-auto w-[80mm] tabular-nums" data-placeholder={sample}>
      <dl className="grid grid-cols-[1fr_auto] gap-y-[1.4mm]">
        <DefinitionRows rows={view.summary} labelClassName="text-doc-ink-muted" valueClassName="text-right" />
        <dt className="border-doc-ink mt-[1.5mm] border-t pt-[2.5mm] text-[10.5pt] font-semibold">
          {view.total.label}
        </dt>
        <dd className="border-doc-ink mt-[1.5mm] border-t pt-[2.5mm] text-right text-[10.5pt] font-semibold">
          {view.total.amount}
        </dd>
      </dl>
      {view.taxBreakdown && (
        <dl className="text-doc-ink-muted mt-[3mm] grid grid-cols-[1fr_auto] gap-y-[0.6mm] text-[8pt]">
          <dt className="col-span-2">{view.taxBreakdown.note}</dt>
          <DefinitionRows rows={view.taxBreakdown.lines} valueClassName="text-right" />
        </dl>
      )}
    </div>
  );
}

function PaymentSection({ payment }: { payment: DocumentViewPayment }) {
  const { bankTransfer, link, qr } = payment;
  const online = link || qr;
  return (
    <section className="document-keep-together mt-[8mm]">
      <Eyebrow>{payment.title}</Eyebrow>
      <div className="mt-[1mm] grid grid-cols-2 gap-x-[12mm] gap-y-[6mm]">
        {bankTransfer && (
          <div>
            <p className="mb-[1.2mm] font-semibold">{bankTransfer.title}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-[5mm] gap-y-[0.8mm]">
              <DefinitionRows rows={bankTransfer.fields} labelClassName="text-doc-ink-muted" valueClassName="font-medium tabular-nums" />
            </dl>
            {bankTransfer.instructions && (
              <p className="text-doc-ink-muted mt-[2mm] whitespace-pre-line">{bankTransfer.instructions}</p>
            )}
          </div>
        )}
        {online && (
          <div className="flex items-start gap-[5mm]">
            {qr && <PaymentQr qr={qr} />}
            <div className="min-w-0">
              {link ? (
                <>
                  <PayLink
                    link={link}
                    className="bg-doc-brand text-doc-paper inline-flex items-center gap-[1.5mm] rounded-[1.2mm] px-[4.5mm] py-[2.2mm] font-semibold no-underline"
                  >
                    <span aria-hidden>→</span>
                  </PayLink>
                  <p className="text-doc-ink-muted mt-[2mm] text-[8pt] [overflow-wrap:anywhere]">{link.display}</p>
                </>
              ) : (
                <p className="font-semibold">{qr?.caption}</p>
              )}
              {qr && link && <p className="text-doc-ink-muted mt-[0.5mm] text-[8pt]">{qr.caption}</p>}
              {qr && !link && <p className="text-doc-ink-muted mt-[1mm] text-[8pt] [overflow-wrap:anywhere]">{qr.display}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Notes({ view }: { view: DocumentView }) {
  const { notes, terms, labels } = view;
  if (!notes && !terms) return null;
  return (
    <section className="document-keep-together mt-[6mm] grid grid-cols-2 gap-x-[12mm]">
      {notes && (
        <div>
          <Eyebrow>{labels.notes}</Eyebrow>
          <p className="whitespace-pre-line">{notes}</p>
        </div>
      )}
      {terms && (
        <div>
          <Eyebrow>{labels.terms}</Eyebrow>
          <p className="text-doc-ink-muted whitespace-pre-line">{terms}</p>
        </div>
      )}
    </section>
  );
}

export function MinimalTemplate({ view }: TemplateProps) {
  const { labels } = view;
  const sample = view.placeholders.has("items") || undefined;

  return (
    // Fills page one so the footer sits at its foot (see --doc-content-height).
    <div className="text-doc-ink flex min-h-(--doc-content-height) flex-col text-[9.5pt] leading-[1.5]">
      <Header view={view} />

      <section className="mt-[9mm] grid grid-cols-[1fr_1fr_auto] gap-x-[8mm]">
        <PartyBlock view={view} party="client" />
        <PartyBlock view={view} party="business" />
        <dl className="grid grid-cols-[auto_auto] content-start gap-x-[5mm] gap-y-[0.8mm] pt-[4.6mm] text-right tabular-nums">
          <dt className="text-doc-ink-muted">{labels.issueDate}</dt>
          <dd>{view.issueDate}</dd>
          <dt className="text-doc-ink-muted">{labels.dueDate}</dt>
          <dd className="font-medium">{view.dueDate}</dd>
        </dl>
      </section>

      <section
        className="border-doc-rule mt-[8mm] flex items-end justify-between border-y py-[3.5mm]"
        data-placeholder={sample}
      >
        <div>
          <Eyebrow>{labels.amountDue}</Eyebrow>
          <p className="text-[20pt] leading-none font-semibold tracking-[-0.025em] tabular-nums">
            {view.total.amount}
          </p>
        </div>
        <p className="text-doc-ink-muted">
          {labels.dueDate} <span className="text-doc-ink font-medium">{view.dueDate}</span>
        </p>
      </section>

      <table className="mt-[7mm] w-full border-collapse" data-placeholder={sample}>
        <thead>
          <tr className="border-doc-rule text-doc-ink-muted border-b text-[7pt] tracking-[0.1em] uppercase">
            <th className="pb-[2.2mm] text-left font-medium">{labels.description}</th>
            <th className="w-[16mm] pb-[2.2mm] text-right font-medium">{labels.quantity}</th>
            <th className="w-[30mm] pb-[2.2mm] text-right font-medium">{labels.unitPrice}</th>
            <th className="w-[32mm] pb-[2.2mm] text-right font-medium">{labels.amount}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {view.items.map((item) => (
            <tr key={item.id} className="border-doc-rule border-b align-top" data-placeholder={sample}>
              <td className="py-[2.4mm] pr-[4mm] whitespace-pre-line">{item.description}</td>
              <td className="py-[2.4mm] text-right">{item.quantity}</td>
              <td className="py-[2.4mm] text-right">{item.unitPrice}</td>
              <td className="py-[2.4mm] text-right">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Totals view={view} sample={sample} />
      {view.payment && <PaymentSection payment={view.payment} />}
      <Notes view={view} />

      <div className="min-h-[6mm] flex-1" />
      <footer className="document-keep-with-previous border-doc-rule text-doc-ink-muted flex justify-between gap-[6mm] border-t pt-[3.5mm] text-[7.5pt]">
        <div className="flex flex-wrap gap-x-[4mm]">
          <Line view={view} field="business.name" value={view.business.name} />
          <Line view={view} field="business.email" value={view.business.email} />
          <Line view={view} field="business.phone" value={view.business.phone} />
        </div>
        <p className="shrink-0 tabular-nums">
          {view.title} {view.number}
        </p>
      </footer>
    </div>
  );
}
