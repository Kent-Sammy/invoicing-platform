import { useId, type ReactNode } from "react";

import { mix } from "@/lib/color";
import type { DocumentTheme, DocumentView, DocumentViewPayment } from "@/lib/documents";

import { DefinitionRows, isSampleParty, ItemDescription, LogoMark, PayLink, PaymentQr, SampleText } from "../kit";
import type { TemplateProps } from "../types";

// Elegant: cinematic, premium, calm. Near-black full-bleed paper, a luminous
// abstract band across the top of page one (vector gradients, generated from
// the brand colour when one is chosen), Newsreader for display figures and
// Bricolage for everything else. Sizes are in pt/mm so preview and PDF match.

/** Template-owned glow palette, used when no brand colour is chosen. */
const DEFAULT_GLOW = { primary: "#3b6ff5", secondary: "#ff7a45", deep: "#b4400f" };

function glowColors(theme: DocumentTheme) {
  if (!theme.brandChosen) return DEFAULT_GLOW;
  return {
    primary: theme.brand,
    secondary: mix(theme.brand, "#ffffff", 0.45),
    deep: mix(theme.brand, "#000000", 0.35),
  };
}

/** The cinematic header band: layered radial glows over a low dark horizon. */
function LightBand({ theme }: { theme: DocumentTheme }) {
  // Unique ids: several renders (preview, thumbnails) share one page.
  const id = useId().replace(/:/g, "");
  const { primary, secondary, deep } = glowColors(theme);
  return (
    <svg
      aria-hidden
      viewBox="0 0 210 58"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 h-[58mm] w-full"
    >
      <defs>
        <radialGradient id={`${id}-a`} cx="0.24" cy="0.78" r="0.62">
          <stop offset="0" stopColor={primary} stopOpacity="1" />
          <stop offset="0.5" stopColor={primary} stopOpacity="0.45" />
          <stop offset="1" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx="0.72" cy="0.72" r="0.5">
          <stop offset="0" stopColor={secondary} stopOpacity="1" />
          <stop offset="0.4" stopColor={deep} stopOpacity="0.7" />
          <stop offset="1" stopColor={deep} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="210" height="58" fill="#0d0d10" />
      <rect width="210" height="58" fill={`url(#${id}-a)`} />
      <rect width="210" height="58" fill={`url(#${id}-b)`} />
      {/* A thin luminous ridge, then the dark horizon (overshoots the edge: no seam). */}
      <path d="M0 52 C 60 44, 120 30, 210 40" fill="none" stroke={secondary} strokeOpacity="0.8" strokeWidth="0.3" />
      <path d="M-1 52 C 60 44, 120 30, 211 40 L211 60 L-1 60 Z" fill="#0d0d10" />
    </svg>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="text-doc-ink-muted text-[6.5pt] font-medium tracking-[0.16em] uppercase">{children}</p>
  );
}

function Header({ view }: { view: DocumentView }) {
  const { logo } = view.branding;
  return (
    // Starts below the light band.
    <header className="mt-[35mm] flex items-start justify-between gap-[10mm]">
      <div>
        {logo ? (
          // Dark logos would vanish on dark paper: a light chip keeps every logo legible.
          <div className="inline-flex rounded-[1.6mm] bg-[#f4f4f5] px-[2.5mm] py-[2mm]">
            <LogoMark logo={logo} area={160} maxWidth={44} maxHeight={12} />
          </div>
        ) : (
          <SampleText
            view={view}
            field="business.name"
            value={view.business.name}
            className="text-[9.5pt] font-semibold tracking-[0.18em] uppercase"
          />
        )}
        <h1 className="font-doc-serif mt-[5mm] text-[42pt] leading-[0.9] font-light tracking-[-0.015em]">
          {view.title}
        </h1>
      </div>
      <p className="text-doc-ink-muted pt-[1mm] text-[8.5pt] tracking-[0.04em] tabular-nums">{view.number}</p>
    </header>
  );
}

function Party({ view, party }: { view: DocumentView; party: "business" | "client" }) {
  const data = view[party];
  return (
    <div data-placeholder={isSampleParty(view, party) || undefined}>
      <Caption>{party === "business" ? view.labels.from : view.labels.to}</Caption>
      <SampleText view={view} field={`${party}.name`} value={data.name} className="mt-[1.6mm] text-[9.5pt] font-semibold" />
      <div className="text-doc-ink-muted mt-[0.4mm] text-[8.5pt]">
        <SampleText view={view} field={`${party}.address`} value={data.address} className="whitespace-pre-line" />
        <SampleText view={view} field={`${party}.email`} value={data.email} />
        {party === "business" && <SampleText view={view} field="business.phone" value={data.phone} />}
        {party === "client" && data.phone && <p>{data.phone}</p>}
        {data.taxId && <p>{data.taxId}</p>}
      </div>
    </div>
  );
}

function Dates({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  const { labels } = view;
  return (
    <div className="text-right tabular-nums">
      <Caption>{labels.issueDate}</Caption>
      <p className="mt-[1mm] text-[9.5pt]">{view.issueDate}</p>
      <div className="mt-[3mm]">
        <Caption>{labels.dueDate}</Caption>
        <p className="mt-[1mm] text-[9.5pt]">{view.dueDate}</p>
      </div>
      <div className="mt-[3mm]" data-placeholder={sample}>
        <Caption>{labels.amountDue}</Caption>
        <p className="font-doc-serif mt-[0.5mm] text-[17pt] leading-tight font-light">{view.total.amount}</p>
      </div>
    </div>
  );
}

function Items({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  const { labels } = view;
  const head = "border-doc-rule border-b pb-[2mm] font-medium";
  return (
    <table className="mt-[8mm] w-full border-collapse" data-placeholder={sample}>
      <thead>
        <tr className="text-doc-ink-muted text-[6.5pt] tracking-[0.16em] uppercase">
          <th className={`${head} text-left`}>{labels.description}</th>
          <th className={`${head} w-[16mm] text-right`}>{labels.quantity}</th>
          <th className={`${head} w-[30mm] text-right`}>{labels.unitPrice}</th>
          <th className={`${head} w-[32mm] text-right`}>{labels.amount}</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {view.items.map((item) => (
          <tr key={item.id} className="border-doc-rule border-b align-top" data-placeholder={sample}>
            <td className="py-[2.4mm] pr-[4mm]">
              <ItemDescription text={item.description} detailClassName="text-doc-ink-muted whitespace-pre-line" />
            </td>
            <td className="text-doc-ink-muted py-[2.4mm] text-right">{item.quantity}</td>
            <td className="text-doc-ink-muted py-[2.4mm] text-right">{item.unitPrice}</td>
            <td className="py-[2.4mm] text-right">{item.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Totals({ view, sample }: { view: DocumentView; sample: true | undefined }) {
  return (
    <div className="document-keep-together mt-[5mm] ml-auto w-[80mm] tabular-nums" data-placeholder={sample}>
      <dl className="grid grid-cols-[1fr_auto] gap-y-[1.4mm] text-[8.5pt]">
        <DefinitionRows rows={view.summary} labelClassName="text-doc-ink-muted" valueClassName="text-right" />
      </dl>
      <div className="border-doc-ink-muted mt-[3mm] flex items-baseline justify-between border-t-[0.2mm] pt-[3mm]">
        <span className="text-[9pt] font-semibold tracking-[0.06em]">{view.total.label}</span>
        <span className="font-doc-serif text-[20pt] leading-none font-light">{view.total.amount}</span>
      </div>
      {view.taxBreakdown && (
        <dl className="text-doc-ink-muted mt-[2.5mm] grid grid-cols-[1fr_auto] gap-y-[0.5mm] text-[7.5pt]">
          <dt className="col-span-2">{view.taxBreakdown.note}</dt>
          <DefinitionRows rows={view.taxBreakdown.lines} valueClassName="text-right" />
        </dl>
      )}
    </div>
  );
}

function BankDetails({ payment }: { payment: DocumentViewPayment }) {
  const bank = payment.bankTransfer;
  return (
    <section className="document-keep-together">
      <Caption>{payment.title}</Caption>
      {bank && (
        <div className="mt-[2mm] text-[8.5pt]">
          <p className="font-semibold">{bank.title}</p>
          <dl className="mt-[0.8mm] grid grid-cols-[auto_1fr] gap-x-[4mm] gap-y-[0.4mm]">
            <DefinitionRows rows={bank.fields} labelClassName="text-doc-ink-muted whitespace-nowrap" valueClassName="tabular-nums" />
          </dl>
          {bank.instructions && (
            <p className="text-doc-ink-muted mt-[1.5mm] whitespace-pre-line">{bank.instructions}</p>
          )}
        </div>
      )}
    </section>
  );
}

function PayOnline({ payment }: { payment: DocumentViewPayment }) {
  const { link, qr } = payment;
  if (!link && !qr) return <div />;
  return (
    <div className="document-keep-together flex items-start gap-[3.5mm] pt-[4.5mm]">
      {qr && (
        // White plate: the QR stays black-on-white on dark paper.
        <div className="shrink-0 rounded-[1.6mm] bg-white p-[1.2mm]">
          <PaymentQr qr={qr} className="size-[20mm] shrink-0" />
        </div>
      )}
      <div className="min-w-0">
        {link && (
          <PayLink
            link={link}
            className="bg-doc-brand text-doc-on-brand inline-flex items-center gap-[1.5mm] rounded-full px-[4.5mm] py-[1.8mm] text-[8.5pt] font-semibold whitespace-nowrap no-underline"
          >
            <span aria-hidden>→</span>
          </PayLink>
        )}
        {qr && <p className={link ? "text-doc-ink-muted mt-[2mm] text-[8pt]" : "text-[8.5pt] font-semibold"}>{qr.caption}</p>}
        <p className="text-doc-ink-muted mt-[0.4mm] text-[7pt] [overflow-wrap:anywhere]">{(link ?? qr)?.display}</p>
      </div>
    </div>
  );
}

function Notes({ view }: { view: DocumentView }) {
  const { notes, terms, labels } = view;
  if (!notes && !terms) return <div />;
  return (
    <section className="document-keep-together space-y-[3.5mm] text-[8.5pt]">
      {notes && (
        <div>
          <Caption>{labels.notes}</Caption>
          <p className="font-doc-serif mt-[1mm] text-[10pt] italic">{notes}</p>
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

export function ElegantTemplate({ view, theme }: TemplateProps) {
  const sample = view.placeholders.has("items") || undefined;

  return (
    <>
      <LightBand theme={theme} />

      <div className="text-doc-ink relative flex min-h-(--doc-content-height) flex-col text-[9pt] leading-[1.5]">
        <Header view={view} />

        <section className="mt-[8mm] grid grid-cols-[1fr_1fr_auto] gap-x-[8mm]">
          <Party view={view} party="business" />
          <Party view={view} party="client" />
          <Dates view={view} sample={sample} />
        </section>

        <Items view={view} sample={sample} />
        <Totals view={view} sample={sample} />

        <div className="min-h-[6mm] flex-1" />
        {(view.payment || view.notes || view.terms) && (
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr] items-start gap-x-[6mm]">
            {view.payment ? <BankDetails payment={view.payment} /> : <div />}
            {view.payment ? <PayOnline payment={view.payment} /> : <div />}
            <Notes view={view} />
          </div>
        )}

        <footer className="document-keep-with-previous border-doc-rule text-doc-ink-muted mt-[6mm] flex justify-between gap-[6mm] border-t pt-[3mm] text-[7pt] tracking-[0.04em]">
          <div className="flex flex-wrap gap-x-[4mm]">
            <SampleText view={view} field="business.name" value={view.business.name} className="text-doc-ink" />
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
