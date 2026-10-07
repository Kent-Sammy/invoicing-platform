import type { ReactNode } from "react";

import type { DocumentView, DocumentViewPayment } from "@/lib/documents";

import { isSampleParty, LogoMark, PayLink, PaymentQr, SampleText } from "../kit";
import type { TemplateProps } from "../types";
import { Bullet, CornerCluster, SunRise } from "./artwork";

// Playful: joyful, graphic and confident. Template-owned motifs in a fixed
// palette; the brand colour (or violet) is the single accent.
// Sizes are in pt/mm so the screen preview and the printed A4 page match.

function Caption({ children, bullet }: { children: ReactNode; bullet?: "circle" | "square" | "half" }) {
  return (
    <p className="text-doc-ink-muted mb-[1.6mm] flex items-center gap-[1.6mm] text-[7.5pt] font-semibold tracking-[0.06em] uppercase">
      {bullet && <Bullet shape={bullet} />}
      {children}
    </p>
  );
}

function Header({ view }: { view: DocumentView }) {
  const { logo } = view.branding;
  return (
    // Keeps clear of the corner artwork on the right.
    <header className="relative max-w-[112mm]">
      {logo ? (
        <LogoMark logo={logo} area={200} maxWidth={52} maxHeight={15} />
      ) : (
        <SampleText
          view={view}
          field="business.name"
          value={view.business.name}
          className="text-[11pt] leading-tight font-bold tracking-[-0.01em]"
        />
      )}
      <h1 className="mt-[5mm] flex items-end gap-[2.2mm] text-[50pt] leading-[0.85] font-extrabold tracking-[-0.045em]">
        {view.title}
        <span aria-hidden className="bg-doc-brand mb-[1.6mm] inline-block size-[4mm] shrink-0 rounded-full" />
      </h1>
    </header>
  );
}

function Sticker({ label, value, dot, strong }: { label: string; value: string; dot: string; strong?: boolean }) {
  return (
    <div className="bg-doc-paper flex items-center gap-[2.5mm] rounded-[3mm] border-[0.35mm] border-[#e9dfcb] px-[3.5mm] py-[2.2mm]">
      <span aria-hidden className={`inline-block size-[2.6mm] shrink-0 rounded-full ${dot}`} />
      <div>
        <p className="text-doc-ink-muted text-[7pt] font-semibold tracking-[0.06em] uppercase">{label}</p>
        <p className={strong ? "text-[11pt] font-extrabold tabular-nums" : "text-[9.5pt] font-semibold tabular-nums"}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Party({ view, party }: { view: DocumentView; party: "business" | "client" }) {
  const data = view[party];
  return (
    <div data-placeholder={isSampleParty(view, party) || undefined}>
      <Caption bullet={party === "client" ? "circle" : "half"}>
        {party === "client" ? view.labels.to : view.labels.from}
      </Caption>
      <SampleText view={view} field={`${party}.name`} value={data.name} className="text-[11pt] font-bold" />
      <div className="text-doc-ink-muted mt-[0.8mm]">
        <SampleText view={view} field={`${party}.address`} value={data.address} className="whitespace-pre-line" />
        <SampleText view={view} field={`${party}.email`} value={data.email} />
        {party === "business" && <SampleText view={view} field="business.phone" value={data.phone} />}
        {party === "client" && data.phone && <p>{data.phone}</p>}
        {data.taxId && <p>{data.taxId}</p>}
      </div>
    </div>
  );
}

/** First description line reads as the item name; further lines as detail. */
function Description({ text }: { text: string }) {
  const [name, ...detail] = text.split("\n");
  return (
    <>
      <p className="font-semibold">{name}</p>
      {detail.length > 0 && <p className="text-doc-ink-muted whitespace-pre-line">{detail.join("\n")}</p>}
    </>
  );
}

function Items({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  const { labels } = view;
  return (
    <div className="mt-[8mm] rounded-[4mm] bg-[#f4ead6] px-[5mm] pt-[3.5mm] pb-[1.5mm]" data-placeholder={sample}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-doc-ink-muted text-[7pt] font-semibold tracking-[0.06em] uppercase">
            <th className="w-[10mm] pb-[2mm] text-left font-semibold">#</th>
            <th className="pb-[2mm] text-left font-semibold">{labels.description}</th>
            <th className="w-[15mm] pb-[2mm] text-right font-semibold">{labels.quantity}</th>
            <th className="w-[28mm] pb-[2mm] text-right font-semibold">{labels.unitPrice}</th>
            <th className="w-[30mm] pb-[2mm] text-right font-semibold">{labels.amount}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {view.items.map((item, index) => (
            <tr
              key={item.id}
              className="border-t-[0.4mm] border-dotted border-[#cdbf9f] align-top"
              data-placeholder={sample}
            >
              <td className="py-[2.2mm]">
                <span className="border-doc-ink inline-flex size-[6mm] items-center justify-center rounded-full border-[0.3mm] text-[7pt] font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </td>
              <td className="py-[2.2mm] pr-[4mm]">
                <Description text={item.description} />
              </td>
              <td className="py-[2.2mm] text-right">{item.quantity}</td>
              <td className="py-[2.2mm] text-right">{item.unitPrice}</td>
              <td className="py-[2.2mm] text-right font-semibold">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Totals({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  return (
    <div className="document-keep-together tabular-nums" data-placeholder={sample}>
      <dl className="grid grid-cols-[1fr_auto] gap-y-[1.4mm] px-[5mm]">
        {view.summary.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-doc-ink-muted">{row.label}</dt>
            <dd className="text-right font-semibold">{row.amount}</dd>
          </div>
        ))}
      </dl>
      <div className="bg-doc-brand text-doc-on-brand mt-[3mm] flex items-center justify-between rounded-full px-[5mm] py-[3mm]">
        <span className="text-[10pt] font-bold">{view.total.label}</span>
        <span className="text-[15pt] leading-none font-extrabold tracking-[-0.02em]">{view.total.amount}</span>
      </div>
      {view.taxBreakdown && (
        <dl className="text-doc-ink-muted mt-[2.5mm] grid grid-cols-[1fr_auto] gap-y-[0.6mm] px-[5mm] text-[8pt]">
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

function BankTransfer({ payment }: { payment: DocumentViewPayment }) {
  const bank = payment.bankTransfer;
  if (!bank) return null;
  return (
    <section className="document-keep-together">
      <Caption bullet="square">{payment.title}</Caption>
      <div className="rounded-[3.5mm] bg-[#e3f7f2] px-[5mm] py-[3.5mm]">
        <p className="mb-[1.2mm] font-bold">{bank.title}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-[5mm] gap-y-[0.6mm]">
          {bank.fields.map((field) => (
            <div key={field.label} className="contents">
              <dt className="text-doc-ink-muted">{field.label}</dt>
              <dd className="font-semibold tabular-nums">{field.value}</dd>
            </div>
          ))}
        </dl>
        {bank.instructions && (
          <p className="text-doc-ink-muted mt-[1.5mm] whitespace-pre-line">{bank.instructions}</p>
        )}
      </div>
    </section>
  );
}

/** Pay button and QR, placed right under the total they pay. */
function PayOnline({ payment }: { payment: DocumentViewPayment }) {
  const { link, qr } = payment;
  if (!link && !qr) return null;
  return (
    <div className="document-keep-together mt-[5mm] flex items-start gap-[4mm]">
      {qr && (
        <div className="shrink-0 rounded-[3mm] bg-white p-[1.2mm] ring-[0.3mm] ring-[#e9dfcb]">
          <PaymentQr qr={qr} className="size-[22mm] shrink-0" />
        </div>
      )}
      <div className="min-w-0 pt-[0.5mm]">
        {link && (
          <PayLink
            link={link}
            className="bg-doc-brand text-doc-on-brand inline-flex items-center gap-[1.5mm] rounded-full px-[5mm] py-[2.2mm] font-bold no-underline"
          >
            <span aria-hidden>→</span>
          </PayLink>
        )}
        {qr && <p className={link ? "mt-[2mm] font-semibold" : "font-semibold"}>{qr.caption}</p>}
        <p className="text-doc-ink-muted mt-[0.6mm] text-[7.5pt] [overflow-wrap:anywhere]">
          {(link ?? qr)?.display}
        </p>
      </div>
    </div>
  );
}

function Notes({ view }: { view: DocumentView }) {
  const { notes, terms, labels } = view;
  if (!notes && !terms) return null;
  return (
    <section className="document-keep-together space-y-[4mm]">
      {notes && (
        <div>
          <Caption bullet="circle">{labels.notes}</Caption>
          <p className="whitespace-pre-line">{notes}</p>
        </div>
      )}
      {terms && (
        <div>
          <Caption bullet="half">{labels.terms}</Caption>
          <p className="text-doc-ink-muted whitespace-pre-line">{terms}</p>
        </div>
      )}
    </section>
  );
}

export function PlayfulTemplate({ view }: TemplateProps) {
  const { labels } = view;
  const sample = view.placeholders.has("items") || undefined;

  return (
    <>
      {/* Template-owned artwork, positioned against the sheet's edges:
          the cluster on page one, the sun at the foot of every page. */}
      <CornerCluster />
      <div className="document-every-page-art" aria-hidden>
        <SunRise />
      </div>

      <div className="text-doc-ink relative flex min-h-(--doc-content-height) flex-col text-[9.5pt] leading-[1.5]">
        <Header view={view} />

        <div className="mt-[7mm] flex flex-wrap gap-[2.5mm]">
          <Sticker label={labels.number} value={view.number} dot="bg-[#2ec4a7]" />
          <Sticker label={labels.issueDate} value={view.issueDate} dot="bg-[#ffc93c]" />
          <Sticker label={labels.dueDate} value={view.dueDate} dot="bg-[#ff6b4a]" />
          <div data-placeholder={sample}>
            <Sticker label={labels.amountDue} value={view.total.amount} dot="bg-doc-brand" strong />
          </div>
        </div>

        <section className="mt-[8mm] grid grid-cols-2 gap-x-[10mm]">
          <Party view={view} party="client" />
          <Party view={view} party="business" />
        </section>

        <Items view={view} sample={sample} />

        <div className="mt-[6mm] grid grid-cols-[1fr_84mm] items-start gap-x-[8mm]">
          <div className="space-y-[5mm]">
            {view.payment && <BankTransfer payment={view.payment} />}
            <Notes view={view} />
          </div>
          <div>
            <Totals view={view} sample={sample} />
            {view.payment && <PayOnline payment={view.payment} />}
          </div>
        </div>

        <div className="min-h-[6mm] flex-1" />
        <footer className="document-keep-with-previous text-doc-ink-muted flex justify-between gap-[6mm] border-t-[0.4mm] border-dotted border-[#cdbf9f] pt-[3mm] text-[7.5pt]">
          <div className="flex flex-wrap gap-x-[4mm]">
            <SampleText view={view} field="business.name" value={view.business.name} className="font-semibold" />
            <SampleText view={view} field="business.email" value={view.business.email} />
            <SampleText view={view} field="business.phone" value={view.business.phone} />
          </div>
          <p className="shrink-0 tabular-nums">
            {view.title} {view.number}
          </p>
        </footer>
      </div>
    </>
  );
}
