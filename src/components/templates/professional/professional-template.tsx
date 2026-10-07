import type { ReactNode } from "react";

import type { DocumentView, DocumentViewPayment } from "@/lib/documents";

import { isSampleParty, LogoMark, PayLink, PaymentQr, SampleText } from "../kit";
import type { TemplateProps } from "../types";

// Professional: structured, confident, business-first. Square corners, a full
// grid, one restrained accent (brand colour, or slate blue by default) used
// for the rule under the header, the table header and the total row.
// Sizes are in pt/mm so the screen preview and the printed A4 page match.

/** Neutral fill for label strips — template-owned, never the brand colour. */
const STRIP = "bg-[#f4f6f9]";

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-doc-ink-muted text-[7pt] font-semibold tracking-[0.09em] uppercase">{children}</p>
  );
}

/** Letterhead: identity and the business's own details on the left, title on the right. */
function Header({ view }: { view: DocumentView }) {
  const { business, branding } = view;
  return (
    <header className="grid grid-cols-[1fr_auto] items-start gap-x-[10mm]">
      <div className="min-w-0" data-placeholder={isSampleParty(view, "business") || undefined}>
        {branding.logo ? (
          <LogoMark logo={branding.logo} area={240} maxWidth={58} maxHeight={18} />
        ) : (
          <SampleText
            view={view}
            field="business.name"
            value={business.name}
            className="text-[14pt] leading-tight font-semibold tracking-[-0.01em]"
          />
        )}
        <div className="text-doc-ink-muted mt-[3mm] text-[8.5pt] leading-[1.45]">
          {branding.logo && (
            <SampleText view={view} field="business.name" value={business.name} className="text-doc-ink font-semibold" />
          )}
          <SampleText view={view} field="business.address" value={business.address} className="whitespace-pre-line" />
          <div className="flex flex-wrap gap-x-[3mm]">
            <SampleText view={view} field="business.email" value={business.email} />
            <SampleText view={view} field="business.phone" value={business.phone} />
          </div>
          {business.taxId && <p>{business.taxId}</p>}
        </div>
      </div>
      <div className="text-right">
        <h1 className="text-doc-brand-text text-[19pt] leading-none font-semibold tracking-[0.12em] uppercase">
          {view.title}
        </h1>
        <p className="text-doc-ink-muted mt-[2.5mm] tabular-nums">
          {view.labels.number} <span className="text-doc-ink font-semibold">{view.number}</span>
        </p>
      </div>
    </header>
  );
}

function BillTo({ view }: { view: DocumentView }) {
  const client = view.client;
  return (
    <div className="border-doc-rule border" data-placeholder={isSampleParty(view, "client") || undefined}>
      <div className={`${STRIP} border-doc-rule border-b px-[4mm] py-[1.4mm]`}>
        <Label>{view.labels.to}</Label>
      </div>
      <div className="px-[4mm] py-[3mm]">
        <SampleText view={view} field="client.name" value={client.name} className="text-[10pt] font-semibold" />
        <div className="text-doc-ink-muted mt-[0.6mm]">
          <SampleText view={view} field="client.address" value={client.address} className="whitespace-pre-line" />
          <SampleText view={view} field="client.email" value={client.email} />
          {client.phone && <p>{client.phone}</p>}
          {client.taxId && <p>{client.taxId}</p>}
        </div>
      </div>
    </div>
  );
}

/** Dates and the amount due — the facts a client acts on. */
function Summary({ view }: { view: DocumentView }) {
  const { labels } = view;
  return (
    // The highlighted amount-due row grows to match the Bill to box beside it.
    <dl className="border-doc-rule grid grid-cols-[auto_1fr] grid-rows-[auto_auto_1fr] border tabular-nums">
      {[
        [labels.issueDate, view.issueDate],
        [labels.dueDate, view.dueDate],
      ].map(([label, value]) => (
        <div key={label} className="contents [&>*]:border-b [&>*]:border-doc-rule">
          <dt className="text-doc-ink-muted px-[4mm] py-[2mm]">{label}</dt>
          <dd className="px-[4mm] py-[2mm] text-right font-medium">{value}</dd>
        </div>
      ))}
      <div className="contents" data-placeholder={view.placeholders.has("items") || undefined}>
        <dt className="bg-doc-brand-subtle flex items-center px-[4mm] py-[3mm] font-semibold">{labels.amountDue}</dt>
        <dd className="bg-doc-brand-subtle flex items-center justify-end px-[4mm] py-[3mm] text-[12pt] leading-none font-bold">
          {view.total.amount}
        </dd>
      </div>
    </dl>
  );
}

/** First description line reads as the item name; further lines as detail. */
function Description({ text }: { text: string }) {
  const [name, ...detail] = text.split("\n");
  return (
    <>
      <p className="font-medium">{name}</p>
      {detail.length > 0 && <p className="text-doc-ink-muted whitespace-pre-line">{detail.join("\n")}</p>}
    </>
  );
}

function Items({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  const { labels } = view;
  const cell = "border-doc-rule border px-[3mm] py-[2mm]";
  return (
    <table className="mt-[6mm] w-full border-collapse" data-placeholder={sample}>
      <thead>
        <tr className="bg-doc-brand text-doc-on-brand text-[7.5pt] tracking-[0.06em] uppercase">
          <th className="border-doc-brand w-[9mm] border px-[2mm] py-[2mm] text-center font-semibold">#</th>
          <th className="border-doc-brand border px-[3mm] py-[2mm] text-left font-semibold">{labels.description}</th>
          <th className="border-doc-brand w-[15mm] border px-[3mm] py-[2mm] text-right font-semibold">{labels.quantity}</th>
          <th className="border-doc-brand w-[29mm] border px-[3mm] py-[2mm] text-right font-semibold">{labels.unitPrice}</th>
          <th className="border-doc-brand w-[31mm] border px-[3mm] py-[2mm] text-right font-semibold">{labels.amount}</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {view.items.map((item, index) => (
          <tr key={item.id} className="align-top" data-placeholder={sample}>
            <td className={`${cell} text-doc-ink-muted px-[2mm] text-center`}>{index + 1}</td>
            <td className={cell}>
              <Description text={item.description} />
            </td>
            <td className={`${cell} text-right`}>{item.quantity}</td>
            <td className={`${cell} text-right`}>{item.unitPrice}</td>
            <td className={`${cell} text-right font-medium`}>{item.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Totals({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  return (
    <div className="document-keep-together tabular-nums" data-placeholder={sample}>
      <dl className="border-doc-rule grid grid-cols-[1fr_auto] border">
        {view.summary.map((row) => (
          <div key={row.label} className="contents">
            <dt className="border-doc-rule text-doc-ink-muted border-b px-[3mm] py-[1.6mm]">{row.label}</dt>
            <dd className="border-doc-rule border-b px-[3mm] py-[1.6mm] text-right font-medium">{row.amount}</dd>
          </div>
        ))}
        <dt className="bg-doc-brand text-doc-on-brand px-[3mm] py-[2.2mm] text-[10pt] font-semibold">
          {view.total.label}
        </dt>
        <dd className="bg-doc-brand text-doc-on-brand px-[3mm] py-[2.2mm] text-right text-[11pt] font-bold">
          {view.total.amount}
        </dd>
      </dl>
      {view.taxBreakdown && (
        <dl className="text-doc-ink-muted mt-[2mm] grid grid-cols-[1fr_auto] gap-y-[0.5mm] px-[3mm] text-[8pt]">
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
  );
}

function Payment({ payment }: { payment: DocumentViewPayment }) {
  const { bankTransfer, link, qr } = payment;
  return (
    <section className="document-keep-together border-doc-rule mt-[7mm] border">
      <div className={`${STRIP} border-doc-rule border-b px-[4mm] py-[1.4mm]`}>
        <Label>{payment.title}</Label>
      </div>
      <div className="grid grid-cols-2 gap-x-[8mm] px-[4mm] py-[3.5mm]">
        {bankTransfer && (
          <div>
            <p className="mb-[1mm] font-semibold">{bankTransfer.title}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-[5mm] gap-y-[0.6mm]">
              {bankTransfer.fields.map((field) => (
                <div key={field.label} className="contents">
                  <dt className="text-doc-ink-muted">{field.label}</dt>
                  <dd className="font-medium tabular-nums">{field.value}</dd>
                </div>
              ))}
            </dl>
            {bankTransfer.instructions && (
              <p className="text-doc-ink-muted mt-[1.5mm] whitespace-pre-line">{bankTransfer.instructions}</p>
            )}
          </div>
        )}
        {(link || qr) && (
          <div className="flex items-start gap-[4mm]">
            {qr && <PaymentQr qr={qr} className="size-[21mm] shrink-0" />}
            <div className="min-w-0">
              {link && (
                <PayLink
                  link={link}
                  className="bg-doc-brand text-doc-on-brand inline-flex items-center gap-[1.5mm] rounded-[1mm] px-[4mm] py-[2mm] font-semibold no-underline"
                >
                  <span aria-hidden>→</span>
                </PayLink>
              )}
              {qr && <p className={link ? "text-doc-ink-muted mt-[2mm]" : "font-semibold"}>{qr.caption}</p>}
              <p className="text-doc-ink-muted mt-[0.5mm] text-[7.5pt] [overflow-wrap:anywhere]">
                {(link ?? qr)?.display}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Notes({ view }: { view: DocumentView }) {
  const { notes, terms, labels } = view;
  if (!notes && !terms) return <div />;
  return (
    <section className="document-keep-together space-y-[4mm]">
      {notes && (
        <div>
          <Label>{labels.notes}</Label>
          <p className="mt-[1mm] whitespace-pre-line">{notes}</p>
        </div>
      )}
      {terms && (
        <div>
          <Label>{labels.terms}</Label>
          <p className="text-doc-ink-muted mt-[1mm] whitespace-pre-line">{terms}</p>
        </div>
      )}
    </section>
  );
}

export function ProfessionalTemplate({ view }: TemplateProps) {
  const sample = view.placeholders.has("items") || undefined;

  return (
    <div className="text-doc-ink flex min-h-(--doc-content-height) flex-col text-[9pt] leading-[1.5]">
      <Header view={view} />
      <div aria-hidden className="bg-doc-brand mt-[6mm] h-[0.8mm]" />

      <section className="mt-[6mm] grid grid-cols-2 gap-x-[6mm]">
        <BillTo view={view} />
        <Summary view={view} />
      </section>

      <Items view={view} sample={sample} />

      <div className="mt-[5mm] grid grid-cols-[1fr_82mm] items-start gap-x-[8mm]">
        <Notes view={view} />
        <Totals view={view} sample={sample} />
      </div>

      {view.payment && <Payment payment={view.payment} />}

      <div className="min-h-[6mm] flex-1" />
      <footer className="document-keep-with-previous border-doc-rule text-doc-ink-muted flex justify-between gap-[6mm] border-t pt-[3mm] text-[7.5pt]">
        <div className="flex flex-wrap gap-x-[4mm]">
          <SampleText view={view} field="business.name" value={view.business.name} className="text-doc-ink font-medium" />
          <SampleText view={view} field="business.email" value={view.business.email} />
          <SampleText view={view} field="business.phone" value={view.business.phone} />
        </div>
        <p className="shrink-0 tabular-nums">
          {view.title} {view.number}
        </p>
      </footer>
    </div>
  );
}
