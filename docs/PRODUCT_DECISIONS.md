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
│   ├── document/             Builder state: DocumentProvider / useDocument, useAssetSrc
│   ├── editor/               Editor panel (not built yet)
│   ├── preview/              DocumentRenderer + DocumentPage (A4 sheet)
│   └── templates/            Template contract, registry, templates
├── config/                   site (app name), countries, currencies, tax presets,
│                             payment terms, asset limits
├── lib/
│   ├── money/                Minor units, exact decimal maths, parsing, formatting
│   ├── calculations/         Line, subtotal, discount, tax, grand total
│   ├── documents/            Document-type definitions, factory, reducer, validation, view model
│   ├── persistence/          DocumentStore interface + localStorage adapter
│   ├── numbering/            Document number formatting + sequence interface + guest counter
│   ├── assets/               AssetStore interface + guest adapter + logo processing
│   ├── guest.ts              Guest-mode wiring: the one place the browser stores are chosen
│   ├── pdf/                  Reserved for server-side PDF, if ever needed
│   ├── dates.ts              The only date formatting/arithmetic in the app
│   └── utils.ts              shadcn `cn`
├── types/                    BusinessDocument, DocumentItem, Party, AssetRef, TemplateId…
├── data/                     Deterministic sample document (dev sandbox + tests)
└── test/                     Test helpers (in-memory Storage)
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
  4. Discounted subtotal = subtotal − discount.
  5. Tax is rounded once to the minor unit: added on top (exclusive) or extracted (inclusive). See 018.
  6. Total = net + tax.
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
- Stored under `invoice-platform:guest-draft` as `{ version, savedAt, document }` (schema version 2 since 015–021). Drafts with a different schema version, corrupt JSON, or an invalid shape are ignored rather than crashing the app.
- `DocumentProvider` loads the draft on mount, autosaves 400 ms after the last change, flushes on `pagehide`, and exposes `reset()`. Reset discards the draft and its logo asset, then starts a new document with the next number.
- The store holds only the document. The model contains no payment credentials, and none may be added.

## 011 — State: one reducer, derived totals

**Status:** Decided · 2026-10-07

- No Redux. `DocumentProvider` holds the single `BusinessDocument` in `useReducer` (`lib/documents/reducer.ts`, pure and testable).
- Totals are **derived** with `useMemo`, never stored. Editor, preview and persistence all read the same document.
- One context is fine at invoice scale. If profiling ever shows re-render cost, split contexts or use selectors then.

## 012 — Currencies and tax as configuration

**Status:** Decided by product owner · 2026-10-07

- `config/currencies.ts`: NGN (default), USD, GBP, EUR, each with its minor units and formatting locale. Adding a currency means adding an entry.
- `config/tax.ts`: suggested tax presets (Nigeria VAT 7.5%). Tax is document-level, **off by default**. Enabling it pre-fills the suggestion for the **business country** (see 017); it was originally keyed on currency.
- Presets are convenience defaults for document generation, **not tax advice**; the user always sets the rate. Totals return a list of `TaxLine`s, so line-level or multiple taxes can be added without changing templates.

## 013 — Document model naming and defaults

**Status:** Decided · 2026-10-07

- The entity is `BusinessDocument` rather than `Document`, to avoid shadowing the DOM's global `Document` type (a forgotten import would otherwise type-check silently against the wrong type).
- Addresses are free-form multi-line text. Formats vary too much by country to structure yet.
- Dates are ISO calendar strings (`"2026-10-07"`), formatted in UTC so they never shift by timezone.
- A new document: next number from the sequence (016), issue date today, due in 14 days (015), one empty line item, Minimal template, brand colour `#171717`.
- `Payment` and `Receipt` types are not defined yet. They will be added when those features are designed.

## 014 — Dark mode: chrome only, paper always white

**Status:** Decided by product owner · 2026-10-07

- App tokens in `globals.css` have light and `.dark` values (shadcn's class-based setup). No theme toggle or `next-themes` dependency yet.
- The document defines its own paper tokens on `.document-page` (`--doc-paper`, `--doc-ink`, `--doc-ink-muted`, `--doc-rule`, `--doc-brand`) with `color-scheme: light`. Templates use only `doc-*` colours, never app tokens. Verified: with dark chrome, the paper stays white.

---

## 015 — Due date defaults to issue date + 14 days

**Status:** Decided by product owner · 2026-10-07

- The document stores both the concrete `dueDate` (always shown and editable) and the `paymentTerms` that produced it: `on_receipt` | `net` (n days) | `custom`.
- New documents use `config/payment-terms.ts` → `{ type: "net", days: 14 }`.
- These rules live in the reducer, not the UI:
  - changing the issue date or terms re-derives the due date;
  - editing the due date directly switches the terms to `custom`, so later issue-date changes leave it alone;
  - an invalid or partly typed issue date never wipes the due date.
- Presets (due on receipt, 7, 30 and 60 days) are already expressible. Only the 14-day default is offered in v1.

## 016 — Numbering: automatic and editable, guest counter

**Status:** Decided by product owner · 2026-10-07

- `DocumentNumberSequence` interface (`lib/numbering/`). The guest implementation keeps a per-type counter in localStorage (`invoice-platform:guest-sequence`) and formats `INV-0001`, `INV-0002`, …
- A number is **allocated when a new document is created**: on a first visit with no draft, and on reset. `number` is a plain editable string (e.g. `KDS-2026-001`).
- Allocation runs once per mount, even under React StrictMode's double effects (verified in the browser).
- Accounts will later swap in a server-controlled, per-business sequence behind the same interface.

## 017 — Business country and locale are separate from currency

**Status:** Decided by product owner · 2026-10-07

- `Business` gains `country` (`config/countries.ts`: NG default, GB, US) and `locale` (BCP 47, defaulting from the country: NG → `en-NG`).
- **Dates and plain numbers** (quantities, percentages) format with the business locale through `lib/dates.ts` and the view model. They are never formatted in components.
- **Money** keeps formatting with the currency's own locale, so the symbol is always native. Formatting money with the business locale would print a naira amount for a US business as "NGN 1,234.50" instead of "₦1,234.50"; a USD amount for a Nigerian business would print "US$" instead of "$".
- The country also drives defaults: currency, locale and tax suggestion. Changing the business country moves the locale unless one is given explicitly.

## 018 — Tax-inclusive and tax-exclusive pricing

**Status:** Decided by product owner · 2026-10-07

- `DocumentTax.mode: "exclusive" | "inclusive"`, default `exclusive`.
- **Exclusive:** total = (subtotal − discount) + tax. Example: Net ₦100,000 + VAT 7.5% ₦7,500 = ₦107,500.
- **Inclusive:** prices already contain tax. The discount applies to the gross amount, then tax is extracted as `gross × rate / (100 + rate)`, rounded once. Net = gross − tax, so net + tax always equals the total exactly. Example: ₦107,500 contains VAT ₦7,500 and net ₦100,000.
- `DocumentTotals` exposes `discountedSubtotal`, `net`, `taxes[]` (each with `mode` and `taxableAmount` = net) and `total`.
- The view model presents inclusive tax as a breakdown under the total ("VAT (7.5%) included · Net · VAT"); exclusive tax is a row above the total. Templates don't branch on tax logic.

## 019 — Payment details on the document

**Status:** Decided by product owner · 2026-10-07

- `paymentDetails: { bankName, accountName, accountNumber, instructions }` on the document. Empty fields are omitted, and the whole section is hidden if nothing is filled in.
- This is display text the business chooses to print, not payment credentials. It is stored in the guest draft. With accounts it can move to the business profile and pre-fill new documents.
- It sits on the document rather than inside `Business` so that a business with several accounts can choose one per invoice.

## 020 — Logos are assets, referenced by id

**Status:** Decided by product owner (processing approach chosen by engineering) · 2026-10-07

- The document stores only `branding.logo: { assetId } | null`. Images live in an `AssetStore`. The guest implementation stores one localStorage entry per asset (`invoice-platform:asset:<id>`), separate from the draft.
- `processLogo` runs in the browser, with no dependencies:
  1. Accepts PNG, JPEG, WebP and SVG. Rejects other types, and files over 2 MB.
  2. Redraws every image on a canvas, resized so the longest side is at most 1200px.
  3. Encodes WebP, which keeps transparency, falling back to PNG where WebP encoding is unsupported (Safari).
  4. Steps quality (0.9 → 0.7), then size (×0.75, down to 256px), until the image is at most 500 KB.
- **SVG sanitisation by rasterisation.** SVGs are drawn to the canvas and stored as WebP, so scripts, event handlers and external references cannot survive. This needs no sanitiser library to keep patched. The tradeoff: logos print from a 1200px raster rather than vector. That is about 600 dpi at a typical 50mm logo width, which is visually lossless on paper.
- Verified in the browser:
  - a worst-case 1.6 MB noise PNG became a 395 KB WebP;
  - a 4.7 MB file and a GIF were rejected;
  - an SVG containing `<script>` became a 1200×480 WebP, and the script never ran;
  - replacing a logo deletes the old asset.
- Why localStorage rather than IndexedDB: simple and synchronous to test. Assets are capped at about 500 KB, so the ~5 MB quota holds a draft plus a logo with room to spare. The `AssetStore` interface allows switching to IndexedDB or cloud storage without touching callers.

## 021 — Print: no page numbers, no fighting browser headers

**Status:** Decided by product owner · 2026-10-07

- v1 has no "Page X of Y" and no page-break markers in the live preview. Browser headers and footers are left to the user's print settings.
- The renderer is already multi-page capable: content flows across A4 pages, table headers repeat, rows and summary blocks (totals, payment details, notes) never split. Verified by printing a 48-line tax-inclusive invoice to a 3-page PDF.

---

## Open decisions

- **Gaps in guest numbering:** numbers are allocated when a document is created, so resetting a draft you never sent skips a number. Alternative: allocate on first print/download, which needs an "issued" state. Acceptable for v1?
- **Following a custom number scheme:** if a user renames `INV-0003` to `KDS-2026-001`, should the next invoice continue as `KDS-2026-002`? Currently the guest counter continues as `INV-0004`.
- **Carrying details to the next invoice:** reset currently clears everything, including business details, payment details and the logo. For repeat guest use, should a new invoice keep the business, payment details and logo?
- **More countries:** NG, GB and US are configured. Which others at launch?
- **Rounding mode:** half away from zero. Confirm this matches what Nigerian accountants expect (vs. banker's rounding).
