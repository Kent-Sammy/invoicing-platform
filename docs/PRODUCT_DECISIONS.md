# Product & Architecture Decisions

A log of important product and architectural decisions. Newest at the bottom.
Each entry records what was decided, why, and any tradeoffs accepted.

Status values: **Decided** · **Proposed** (awaiting product owner) · **Superseded**

---

## 001 — Foundation stack

**Status:** Decided · 2026-10-07

- Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript 5 (strict, target ES2022).
- Tailwind CSS 4 (CSS-first config in `src/app/globals.css`, no `tailwind.config`).
- shadcn/ui 4 with Radix primitives (see 008), Lucide icons.
- Vitest for unit tests.
- npm as the package manager (ships with Node; no extra tooling).
- Node.js 24 LTS, installed via nvm (`.nvmrc`).

## 002 — shadcn/ui primitives: Base UI

**Status:** Superseded by 008 · 2026-10-07

## 003 — Next.js Cache Components left enabled

**Status:** Decided · 2026-10-07

`create-next-app` 16.4 enables `cacheComponents` and `partialPrefetching` by default. We keep them.

- The builder is primarily a client-side interactive experience, so this has little impact now.
- When server data arrives (accounts, saved documents), data fetching is dynamic by default and caching is opt-in via `use cache`.

## 004 — Motion deferred

**Status:** Decided · 2026-10-07

Motion is part of the approved stack but is **not installed yet**. It will be added with the first feature where it improves usability or adds subtle polish. No flashy animation in the invoice editor.

## 005 — Repository structure

**Status:** Decided · 2026-10-07

```
src/
├── app/
│   ├── globals.css           App design tokens (light/dark) + Tailwind setup
│   ├── document.css          Paper tokens + print CSS for the document
│   └── dev/document/         Dev-only renderer/print sandbox (404 in production)
├── components/
│   ├── ui/                   shadcn/ui primitives, restyled to our design system
│   ├── document/             Builder state: DocumentProvider / useDocument
│   ├── editor/               Editor panel (not built yet)
│   ├── preview/              DocumentRenderer + DocumentPage (A4 sheet)
│   └── templates/            Template contract, registry, templates
├── config/                   site (app name), currencies, tax presets
├── lib/
│   ├── money/                Minor units, exact decimal maths, parsing, formatting
│   ├── calculations/         Line, subtotal, discount, tax, grand total
│   ├── documents/            Document-type definitions, factory, reducer, validation, view model
│   ├── persistence/          DocumentStore interface + localStorage adapter
│   ├── pdf/                  Reserved for server-side PDF, if ever needed
│   ├── dates.ts
│   └── utils.ts              shadcn `cn`
├── types/                    BusinessDocument, DocumentItem, Party, TemplateId…
└── data/                     Deterministic sample document (dev sandbox + tests)
```

Deviations from the originally proposed structure, and why:

- **`components/invoice/` → `components/document/`.** Invoice-specific naming would pull the codebase toward an invoice-only implementation.
- **`lib/currency/` + `lib/tax/` → `config/` + `lib/money/` + `lib/calculations/`.** Currency and tax *definitions* are configuration (`config/`). Money arithmetic and formatting are one concern (`lib/money/`). Tax and discount are steps in the totals calculation (`lib/calculations/`).
- **`lib/utils/` → `lib/utils.ts`.** shadcn generates this file; a sibling folder would create an ambiguous import path.
- **Added `lib/documents/` and `lib/persistence/`.** Document types are configuration, so new types are added as data. Persistence is isolated behind an interface.

## 006 — Templates consume the same document data

**Status:** Decided · 2026-10-07

The rendering pipeline is:

```
BusinessDocument ─► calculateTotals ─► createDocumentView ─► Template ─► DocumentPage (A4)
                                                                            ├─ live preview
                                                                            └─ browser print / Save as PDF
```

- Templates receive a `DocumentView`: every amount, date and label is already calculated and formatted. Templates own no state and do no maths, so no template can disagree with the calculation engine.
- Adding a template means adding its id to `TemplateId` and an entry to `components/templates/registry.ts`.
- Unknown template ids (e.g. from an old saved draft) fall back to the default.

## 007 — Money: integer minor units, half-away-from-zero rounding

**Status:** Decided · 2026-10-07

- All money is an integer number of minor units (`MinorUnits`): ₦250,000 → `25000000`, $100.50 → `10050`.
- Quantities (up to 4 dp) and percentages (up to 4 dp) are converted to scaled integers via their decimal string form, so `1.005` is treated as exactly 1.005, not 1.00499999…
- Intermediate arithmetic uses `BigInt`; results are converted back to safe JS integers, and anything beyond `Number.MAX_SAFE_INTEGER` throws rather than silently losing precision.
- **Rounding:** half away from zero ("commercial rounding"), in one place: `lib/money/decimal.ts`.
- **Order of operations:**
  1. Line total = quantity × unit price, rounded per line.
  2. Subtotal = sum of rounded lines, so printed lines always add up.
  3. Discount (percentage or fixed) is clamped to between 0 and the subtotal.
  4. Taxable subtotal = subtotal − discount.
  5. Tax = taxable subtotal × rate, rounded once to the minor unit.
  6. Total = taxable subtotal + tax.
- Display formatting is exact too: amounts go to `Intl.NumberFormat` as decimal strings, never as floats.
- `tsconfig` target raised from ES2017 to ES2022 for BigInt literals. This affects type-checking only; Next.js compiles for its own browser targets, all of which support BigInt.

## 008 — UI primitives: shadcn/ui + Radix

**Status:** Decided by product owner · 2026-10-07

shadcn/ui re-initialised with Radix primitives (`radix-nova` style, `radix-ui` package). `@base-ui/react` removed. No other UI library.

## 009 — PDF: the HTML preview is the PDF

**Status:** Decided by product owner · 2026-10-07

- No PDF library. The document is real HTML/CSS designed for A4 print. "Download PDF" will, for now, invoke the browser's print / Save as PDF.
- Print CSS lives in `src/app/document.css`: `@page { size: A4; margin: 18mm }`, colour preservation, page-break helpers (`document-keep-together`, `document-page-break`), table headers repeat on every page, and table rows never split.
- On screen, the sheet is 210mm wide with 18mm padding. In print, the padding is replaced by the `@page` margin, so content width is identical in preview and PDF.
- **Rule:** anything wrapping the document must not constrain its width in print (use `print:w-auto` etc.), and app chrome must use `print:hidden`. This was found and fixed during verification: a `w-fit` wrapper made printed content half-width.
- Verified with headless Chrome print-to-PDF: a single-page invoice, and a 48-line invoice across 3 pages.
- Server-side PDF generation stays a later option (`lib/pdf/`). It would render this same HTML.

## 010 — Guest persistence via a swappable store

**Status:** Decided by product owner · 2026-10-07

- `DocumentStore` interface (`load` / `save` / `clear`, async so a remote store fits later). The guest implementation is `createLocalStorageDocumentStore`.
- Stored under `invoice-platform:guest-draft` as `{ version, savedAt, document }`. Drafts with a different schema version, corrupt JSON, or an invalid shape are ignored rather than crashing the app.
- `DocumentProvider` loads the draft on mount, autosaves 400 ms after the last change, flushes on `pagehide`, and exposes `reset()` to discard the draft.
- The store holds only the document. The model contains no payment credentials, and none may be added.

## 011 — State: one reducer, derived totals

**Status:** Decided · 2026-10-07

- No Redux. `DocumentProvider` holds the single `BusinessDocument` in `useReducer` (`lib/documents/reducer.ts`, pure and testable).
- Totals are **derived** with `useMemo`, never stored. Editor, preview and persistence all read the same document.
- One context is fine at invoice scale. If profiling ever shows re-render cost, split contexts or use selectors then.

## 012 — Currencies and tax as configuration

**Status:** Decided by product owner · 2026-10-07

- `config/currencies.ts`: NGN (default), USD, GBP, EUR, each with its minor units and formatting locale. Adding a currency means adding an entry.
- `config/tax.ts`: suggested tax presets by country (Nigeria VAT 7.5%). Tax is document-level, **off by default**. Enabling it pre-fills the suggestion for the currency (NGN → "VAT 7.5%"; others → "Tax 0%").
- Presets are convenience defaults for document generation, **not tax advice**; the user always sets the rate. Totals return a list of `TaxLine`s, so line-level or multiple taxes can be added without changing templates.

## 013 — Document model naming and defaults

**Status:** Decided · 2026-10-07

- The entity is `BusinessDocument` rather than `Document`, to avoid shadowing the DOM's global `Document` type (a forgotten import would otherwise type-check silently against the wrong type).
- Addresses are free-form multi-line text. Formats vary too much by country to structure yet.
- Dates are ISO calendar strings (`"2026-10-07"`), formatted in UTC so they never shift by timezone.
- A new document: number `INV-0001`, issue date today, **no due date**, one empty line item, Minimal template, brand colour `#171717`.
- `Payment` and `Receipt` types are not defined yet. They will be added when those features are designed.

## 014 — Dark mode: chrome only, paper always white

**Status:** Decided by product owner · 2026-10-07

- App tokens in `globals.css` have light and `.dark` values (shadcn's class-based setup). No theme toggle or `next-themes` dependency yet.
- The document defines its own paper tokens on `.document-page` (`--doc-paper`, `--doc-ink`, `--doc-ink-muted`, `--doc-rule`, `--doc-brand`) with `color-scheme: light`. Templates use only `doc-*` colours, never app tokens. Verified: with dark chrome, the paper stays white.

---

## Open decisions

- **Default due date / payment terms:** a new invoice currently has no due date. Should it default to e.g. +14 days?
- **Invoice numbering:** always `INV-0001` for guests today. Should it be user-editable only, or auto-increment once documents are saved?
- **Document locale:** dates and numbers currently format using the currency's locale (NGN → en-NG). Later this should probably follow the business's country.
- **Page numbers in PDF:** CSS page-margin boxes ("Page 1 of 3") work in Chrome but not Safari or Firefox. Do we want them?
- **Browser print headers/footers:** the browser may add the URL and date to the PDF unless the user unticks "Headers and footers". Hiding them reliably needs `@page { margin: 0 }`, which removes page margins on pages 2+. Accept, or rely on user settings?
- **Multi-page preview:** the on-screen preview is one continuous sheet, while print paginates. Showing page breaks in the preview requires measuring content. Is that worth it for v1?
- **Bank / payment details on invoices:** many Nigerian invoices list bank account details as payment instructions. Is this printed text in scope, given the "no sensitive payment info in storage" rule?
- **Tax-inclusive prices:** currently all prices are tax-exclusive.
- **Logo storage:** logos stored as data URLs count against the browser's roughly 5 MB localStorage limit. We need a size cap or image compression on upload.
