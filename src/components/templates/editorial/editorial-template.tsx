import type { CSSProperties, ReactNode } from "react";

import type { DocumentView, DocumentViewPayment } from "@/lib/documents";

import { DefinitionRows, isSampleParty, ItemDescription, LogoMark, PayLink, PaymentQr, SampleText } from "../kit";
import type { TemplateProps } from "../types";

// Editorial: Swiss, type-led, art-directed. The page is an acid-lime colour
// field (template-owned paper); display words and rules take the accent —
// ink by default, or the brand colour adjusted to read on lime. Bricolage
// carries the display type; Newsreader is the second, "magazine" voice.
// Sizes are in pt/mm so the screen preview and the printed A4 page match.

const CONTENT_WIDTH_MM = 174;

/**
 * Fits the bracketed wordmark to the content width from its length, so a
 * short name is huge and a long one stays on the page (wrapping as a last
 * resort). Bricolage 800 caps (with spaces) average about 0.55em per character.
 */
function wordmarkStyle(text: string): CSSProperties {
  const characters = text.length + 2; // the brackets
  const size = Math.min(28, Math.max(8, CONTENT_WIDTH_MM / (characters * 0.55)));
  return { fontSize: `${size.toFixed(2)}mm` };
}

function Small({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`text-[7pt] font-bold tracking-[0.02em] uppercase ${className ?? ""}`}>{children}</p>;
}

/** Real values set in brackets — the template's typographic signature. */
function Bracketed({ children }: { children: ReactNode }) {
  return (
    <>
      [{children}]
    </>
  );
}

function Masthead({ view }: { view: DocumentView }) {
  const name = view.business.name;
  const sample = view.placeholders.has("business.name") || undefined;
  return (
    <header>
      <h2
        className="text-doc-brand-text leading-[0.95] font-extrabold tracking-[-0.035em] uppercase"
        style={wordmarkStyle(name)}
        data-placeholder={sample}
      >
        <Bracketed>{name}</Bracketed>
      </h2>
    </header>
  );
}

function MetaRow({ view }: { view: DocumentView }) {
  const { logo } = view.branding;
  return (
    <section className="mt-[13mm] flex items-end justify-between gap-[8mm]">
      <div className="flex items-end gap-[8mm] text-[10pt] leading-[1.25] font-bold tabular-nums">
        {logo && <LogoMark logo={logo} area={120} maxWidth={36} maxHeight={12} className="object-contain object-left-bottom" />}
        <div>
          <p>
            <Bracketed>{view.issueDate}</Bracketed>
          </p>
          <p data-placeholder={view.placeholders.has("client.name") || undefined}>
            <Bracketed>{view.client.name}</Bracketed>
          </p>
        </div>
        <div>
          <p>
            <Bracketed>#{view.number}</Bracketed>
          </p>
          <p className="text-doc-ink-muted font-semibold">
            {view.labels.dueDate} <Bracketed>{view.dueDate}</Bracketed>
          </p>
        </div>
      </div>
      <h1 className="text-doc-brand-text text-[27pt] leading-none font-extrabold tracking-[-0.03em] uppercase">
        {view.title}
      </h1>
    </section>
  );
}

/** Client details beyond the name (the name sits in the meta row). */
function ClientDetails({ view }: { view: DocumentView }) {
  const client = view.client;
  const hasDetails = client.address || client.email || client.phone || client.taxId;
  if (!hasDetails) return null;
  return (
    <div
      className="text-doc-ink-muted mt-[3mm] flex flex-wrap gap-x-[6mm] text-[8pt]"
      data-placeholder={isSampleParty(view, "client") || undefined}
    >
      <Small className="text-doc-ink">{view.labels.to}</Small>
      <SampleText view={view} field="client.address" value={client.address} className="whitespace-pre-line" />
      <SampleText view={view} field="client.email" value={client.email} />
      {client.phone && <p>{client.phone}</p>}
      {client.taxId && <p>{client.taxId}</p>}
    </div>
  );
}

function Items({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  const { labels } = view;
  return (
    <table className="mt-[3mm] w-full border-collapse" data-placeholder={sample}>
      <thead>
        <tr className="text-[7pt] font-bold tracking-[0.02em] uppercase">
          <th className="pt-[2mm] pb-[1.5mm] text-left font-bold">{labels.description}</th>
          <th className="w-[16mm] pt-[2mm] pb-[1.5mm] text-right font-bold">{labels.quantity}</th>
          <th className="w-[28mm] pt-[2mm] pb-[1.5mm] text-right font-bold">{labels.unitPrice}</th>
          <th className="w-[30mm] pt-[2mm] pb-[1.5mm] text-right font-bold">{labels.amount}</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {view.items.map((item) => (
          <tr key={item.id} className="align-top" data-placeholder={sample}>
            <td className="py-[1.8mm] pr-[4mm]">
              <ItemDescription text={item.description} nameClassName="font-bold" detailClassName="font-doc-serif text-doc-ink-muted pl-[6mm] text-[9pt] whitespace-pre-line" />
            </td>
            <td className="py-[1.8mm] text-right font-semibold">{item.quantity}</td>
            <td className="py-[1.8mm] text-right font-semibold">{item.unitPrice}</td>
            <td className="py-[1.8mm] text-right font-bold">{item.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Totals({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  return (
    <div className="document-keep-together mt-[14mm] ml-auto w-[86mm] tabular-nums" data-placeholder={sample}>
      <dl className="grid grid-cols-[1fr_auto] gap-y-[0.6mm] text-[9pt] font-bold uppercase">
        <DefinitionRows rows={view.summary} valueClassName="text-right" />
      </dl>
      <div className="border-doc-brand-text mt-[3mm] flex items-baseline justify-between border-t-[0.5mm] pt-[2mm]">
        <span className="text-doc-brand-text text-[10pt] font-extrabold uppercase">{view.total.label}</span>
        <span className="text-doc-brand-text text-[17pt] leading-none font-extrabold tracking-[-0.02em]">
          {view.total.amount}
        </span>
      </div>
      {view.taxBreakdown && (
        <dl className="text-doc-ink-muted mt-[2mm] grid grid-cols-[1fr_auto] text-[8pt] font-semibold">
          <dt className="col-span-2">{view.taxBreakdown.note}</dt>
          <DefinitionRows rows={view.taxBreakdown.lines} valueClassName="text-right" />
        </dl>
      )}
    </div>
  );
}

function Payment({ payment }: { payment: DocumentViewPayment }) {
  const { bankTransfer, link, qr } = payment;
  return (
    <div className="document-keep-together">
      <h2 className="text-doc-brand-text text-[26pt] leading-none font-extrabold tracking-[-0.03em] uppercase">
        {payment.title}
      </h2>
      <div className="mt-[4mm] flex items-start gap-[6mm]">
        {bankTransfer && (
          <div className="min-w-0 flex-1 text-[8pt] leading-[1.45] font-bold tabular-nums">
            <Small>
              <Bracketed>{bankTransfer.title}</Bracketed>
            </Small>
            <dl className="mt-[1.5mm] grid grid-cols-[auto_1fr] gap-x-[2mm]">
              {bankTransfer.fields.map((field) => (
                <div key={field.label} className="contents">
                  <dt className="whitespace-nowrap uppercase">{field.label}:</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
            {bankTransfer.instructions && (
              <p className="font-doc-serif mt-[1.5mm] max-w-[52mm] text-[8.5pt] font-normal whitespace-pre-line">
                {bankTransfer.instructions}
              </p>
            )}
          </div>
        )}
        {(link || qr) && (
          <div className="flex shrink-0 flex-col items-start gap-[2mm]">
            {qr && (
              <>
                <PaymentQr qr={qr} className="size-[22mm] shrink-0" />
                <Small>{qr.caption}</Small>
              </>
            )}
            {link && (
              <PayLink
                link={link}
                className="bg-doc-brand-text text-doc-paper inline-flex items-center gap-[1.5mm] px-[3.5mm] py-[1.8mm] text-[8.5pt] font-extrabold uppercase no-underline"
              >
                <span aria-hidden>→</span>
              </PayLink>
            )}
            <p className="text-doc-ink-muted max-w-[52mm] text-[7pt] font-semibold [overflow-wrap:anywhere]">
              {(link ?? qr)?.display}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SmallPrint({ view }: { view: DocumentView }) {
  const { notes, terms, labels } = view;
  if (!notes && !terms) return null;
  return (
    <div className="document-keep-together font-doc-serif space-y-[3mm] text-[8.5pt] leading-[1.4]">
      {notes && (
        <div>
          <p className="font-doc-sans text-[7pt] font-bold uppercase">{labels.notes}</p>
          <p className="mt-[0.5mm] whitespace-pre-line">{notes}</p>
        </div>
      )}
      {terms && (
        <div>
          <p className="font-doc-sans text-[7pt] font-bold uppercase">{labels.terms}</p>
          <p className="mt-[0.5mm] whitespace-pre-line">{terms}</p>
        </div>
      )}
    </div>
  );
}

/** The business's details in four short columns along the foot. */
function Footer({ view }: { view: DocumentView }) {
  const business = view.business;
  return (
    <footer
      className="document-keep-with-previous border-doc-brand-text mt-[6mm] grid grid-cols-4 gap-x-[4mm] border-t-[0.5mm] pt-[2.5mm] text-[7pt] leading-[1.35] font-bold uppercase"
      data-placeholder={isSampleParty(view, "business") || undefined}
    >
      <div>
        <SampleText view={view} field="business.name" value={business.name} />
        {business.taxId && <p>{business.taxId}</p>}
      </div>
      <div>
        <SampleText view={view} field="business.address" value={business.address} className="whitespace-pre-line" />
      </div>
      <div className="normal-case">
        <SampleText view={view} field="business.email" value={business.email} />
        <SampleText view={view} field="business.phone" value={business.phone} />
      </div>
      <p className="text-right tabular-nums">
        {view.title} {view.number}
      </p>
    </footer>
  );
}

export function EditorialTemplate({ view }: TemplateProps) {
  const sample = view.placeholders.has("items") || undefined;

  return (
    <div className="text-doc-ink flex min-h-(--doc-content-height) flex-col text-[9.5pt] leading-[1.45]">
      <Masthead view={view} />
      <MetaRow view={view} />
      <div aria-hidden className="bg-doc-brand-text mt-[3mm] h-[0.5mm]" />
      <ClientDetails view={view} />

      <Items view={view} sample={sample} />
      <Totals view={view} sample={sample} />

      {/* Deliberate negative space, then payment and small print at the foot. */}
      <div className="min-h-[10mm] flex-1" />
      {(view.payment || view.notes || view.terms) && (
        <section className="border-doc-brand-text grid grid-cols-[1fr_58mm] gap-x-[8mm] border-t-[0.5mm] pt-[4mm]">
          <div>{view.payment && <Payment payment={view.payment} />}</div>
          <SmallPrint view={view} />
        </section>
      )}
      <Footer view={view} />
    </div>
  );
}
