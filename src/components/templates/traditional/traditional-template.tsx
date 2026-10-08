import type { ReactNode } from "react";

import type { DocumentView, DocumentViewPayment } from "@/lib/documents";

import { DefinitionRows, isSampleParty, ItemDescription, LogoMark, PayLink, PaymentQr, SampleText } from "../kit";
import type { TemplateProps } from "../types";

// Traditional: conventional business stationery. Built from rules and type
// only — no fills, no boxes — with a restrained navy accent (or the brand
// colour, darkened for legibility). Distinct from Professional's grid and
// colour blocks. Sizes are in pt/mm so preview and printed A4 match.

function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-doc-ink-muted text-[7pt] font-semibold tracking-[0.14em] uppercase ${className ?? ""}`}>
      {children}
    </p>
  );
}

/** Heavy accent line over a hairline — the stationery double rule. */
function DoubleRule({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <div className="bg-doc-brand-text h-[0.55mm]" />
      <div className="bg-doc-brand-text mt-[0.7mm] h-[0.18mm]" />
    </div>
  );
}

function Letterhead({ view }: { view: DocumentView }) {
  const { logo } = view.branding;
  return (
    <header className="flex flex-col items-center text-center">
      {logo && <LogoMark logo={logo} area={230} maxWidth={60} maxHeight={18} className="object-contain object-center" />}
      <SampleText
        view={view}
        field="business.name"
        value={view.business.name}
        className={`${logo ? "mt-[3mm] text-[11pt]" : "text-[15pt]"} font-semibold tracking-[0.06em] uppercase`}
      />
    </header>
  );
}

function TitleRow({ view }: { view: DocumentView }) {
  const { labels } = view;
  const meta: [string, string][] = [
    [labels.number, view.number],
    [labels.issueDate, view.issueDate],
    [labels.dueDate, view.dueDate],
  ];
  return (
    <section className="mt-[6mm] flex items-end justify-between gap-[8mm]">
      <h1 className="text-doc-brand-text text-[17pt] leading-none font-semibold tracking-[0.22em] uppercase">
        {view.title}
      </h1>
      <dl className="flex tabular-nums">
        {meta.map(([label, value], index) => (
          <div key={label} className={index > 0 ? "border-doc-rule border-l pl-[5mm] ml-[5mm]" : undefined}>
            <dt>
              <Caption>{label}</Caption>
            </dt>
            <dd className="mt-[0.8mm] text-[9.5pt] font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Party({ view, party }: { view: DocumentView; party: "business" | "client" }) {
  const data = view[party];
  return (
    <div data-placeholder={isSampleParty(view, party) || undefined}>
      <Caption>{party === "business" ? view.labels.from : view.labels.to}</Caption>
      <SampleText view={view} field={`${party}.name`} value={data.name} className="mt-[1.5mm] text-[10pt] font-semibold" />
      <div className="text-doc-ink-muted mt-[0.5mm]">
        <SampleText view={view} field={`${party}.address`} value={data.address} className="whitespace-pre-line" />
        <SampleText view={view} field={`${party}.email`} value={data.email} />
        {party === "business" && <SampleText view={view} field="business.phone" value={data.phone} />}
        {party === "client" && data.phone && <p>{data.phone}</p>}
        {data.taxId && <p>{data.taxId}</p>}
      </div>
    </div>
  );
}

function Items({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  const { labels } = view;
  const head = "border-doc-brand-text border-y-[0.4mm] py-[2mm] font-semibold";
  return (
    <table className="mt-[8mm] w-full border-collapse" data-placeholder={sample}>
      <thead>
        <tr className="text-doc-ink-muted text-[7pt] tracking-[0.12em] uppercase">
          <th className={`${head} w-[10mm] text-left`}>No.</th>
          <th className={`${head} text-left`}>{labels.description}</th>
          <th className={`${head} w-[16mm] text-right`}>{labels.quantity}</th>
          <th className={`${head} w-[30mm] text-right`}>{labels.unitPrice}</th>
          <th className={`${head} w-[32mm] text-right`}>{labels.amount}</th>
        </tr>
      </thead>
      <tbody className="border-doc-brand-text border-b-[0.4mm] tabular-nums">
        {view.items.map((item, index) => (
          <tr key={item.id} className="border-doc-rule border-b align-top last:border-b-0" data-placeholder={sample}>
            <td className="text-doc-ink-muted py-[2.4mm]">{index + 1}.</td>
            <td className="py-[2.4mm] pr-[4mm]">
              <ItemDescription text={item.description} detailClassName="text-doc-ink-muted whitespace-pre-line" />
            </td>
            <td className="py-[2.4mm] text-right">{item.quantity}</td>
            <td className="py-[2.4mm] text-right">{item.unitPrice}</td>
            <td className="py-[2.4mm] text-right">{item.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Totals({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  return (
    <div className="document-keep-together tabular-nums" data-placeholder={sample}>
      <dl className="grid grid-cols-[1fr_auto] gap-y-[1.3mm]">
        <DefinitionRows rows={view.summary} labelClassName="text-doc-ink-muted" valueClassName="text-right" />
      </dl>
      {/* Grand total: a rule above, the accounting double rule below. */}
      <div className="border-doc-brand-text mt-[2.5mm] flex items-baseline justify-between border-t-[0.35mm] pt-[2.2mm] pb-[1.6mm]">
        <span className="text-[10pt] font-semibold tracking-[0.06em] uppercase">{view.total.label}</span>
        <span className="text-[12pt] font-semibold">{view.total.amount}</span>
      </div>
      <DoubleRule />
      {view.taxBreakdown && (
        <dl className="text-doc-ink-muted mt-[2.5mm] grid grid-cols-[1fr_auto] gap-y-[0.5mm] text-[8pt]">
          <dt className="col-span-2">{view.taxBreakdown.note}</dt>
          <DefinitionRows rows={view.taxBreakdown.lines} valueClassName="text-right" />
        </dl>
      )}
    </div>
  );
}

function PaymentInformation({ payment }: { payment: DocumentViewPayment | null }) {
  if (!payment) return <div />;
  const { bankTransfer, link, qr } = payment;
  return (
    <section className="document-keep-together">
      <Caption className="border-doc-rule border-b pb-[1.5mm]">{payment.title}</Caption>
      {bankTransfer && (
        <div className="mt-[2.5mm]">
          <p className="font-semibold">{bankTransfer.title}</p>
          <dl className="mt-[0.8mm] grid grid-cols-[auto_1fr] gap-x-[5mm] gap-y-[0.5mm]">
            <DefinitionRows rows={bankTransfer.fields} labelClassName="text-doc-ink-muted" valueClassName="tabular-nums" />
          </dl>
          {bankTransfer.instructions && (
            <p className="text-doc-ink-muted mt-[1.5mm] whitespace-pre-line">{bankTransfer.instructions}</p>
          )}
        </div>
      )}
      {(link || qr) && (
        <div className="mt-[3.5mm] flex items-start gap-[4mm]">
          {qr && <PaymentQr qr={qr} className="size-[20mm] shrink-0" />}
          <div className="min-w-0">
            {link && (
              <PayLink
                link={link}
                className="border-doc-brand-text text-doc-brand-text inline-flex items-center gap-[1.5mm] border-[0.35mm] px-[3.5mm] py-[1.6mm] font-semibold tracking-[0.04em] no-underline"
              >
                <span aria-hidden>→</span>
              </PayLink>
            )}
            {qr && <p className={link ? "text-doc-ink-muted mt-[1.8mm]" : "font-semibold"}>{qr.caption}</p>}
            <p className="text-doc-ink-muted mt-[0.4mm] text-[7.5pt] [overflow-wrap:anywhere]">
              {(link ?? qr)?.display}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function NotesAndTerms({ view }: { view: DocumentView }) {
  const { notes, terms, labels } = view;
  if (!notes && !terms) return null;
  return (
    <section className="document-keep-together border-doc-rule mt-[7mm] grid grid-cols-2 gap-x-[10mm] border-t pt-[3mm] text-[8.5pt]">
      {notes && (
        <div>
          <Caption>{labels.notes}</Caption>
          <p className="mt-[1mm] whitespace-pre-line">{notes}</p>
        </div>
      )}
      {terms && (
        <div>
          <Caption>{labels.terms}</Caption>
          <p className="text-doc-ink-muted mt-[1mm] whitespace-pre-line">{terms}</p>
        </div>
      )}
    </section>
  );
}

export function TraditionalTemplate({ view }: TemplateProps) {
  const sample = view.placeholders.has("items") || undefined;

  return (
    <div className="text-doc-ink flex min-h-(--doc-content-height) flex-col text-[9pt] leading-[1.5]">
      <Letterhead view={view} />
      <DoubleRule className="mt-[5mm]" />
      <TitleRow view={view} />

      <section className="border-doc-rule mt-[7mm] grid grid-cols-2 border-y py-[4mm]">
        <div className="border-doc-rule border-r pr-[8mm]">
          <Party view={view} party="business" />
        </div>
        <div className="pl-[8mm]">
          <Party view={view} party="client" />
        </div>
      </section>

      <Items view={view} sample={sample} />

      <div className="mt-[6mm] grid grid-cols-[1fr_78mm] items-start gap-x-[12mm]">
        <PaymentInformation payment={view.payment} />
        <Totals view={view} sample={sample} />
      </div>

      <NotesAndTerms view={view} />

      {/* No signature area: there's no signature data in v1 (decision 024). */}
      <div className="min-h-[6mm] flex-1" />
      <footer className="document-keep-with-previous border-doc-rule text-doc-ink-muted border-y py-[2.2mm] text-center text-[7.5pt]">
        <div className="flex flex-wrap justify-center gap-x-[3mm]">
          <SampleText view={view} field="business.name" value={view.business.name} className="text-doc-ink font-semibold" />
          <SampleText view={view} field="business.email" value={view.business.email} />
          <SampleText view={view} field="business.phone" value={view.business.phone} />
          <p className="tabular-nums">
            {view.title} {view.number}
          </p>
        </div>
      </footer>
    </div>
  );
}
