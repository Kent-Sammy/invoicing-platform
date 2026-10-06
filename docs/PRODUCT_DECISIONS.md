# Product & Architecture Decisions

A log of important product and architectural decisions. Newest at the bottom.
Each entry records what was decided, why, and any tradeoffs accepted.

Status values: **Decided** · **Proposed** (awaiting product owner) · **Superseded**

---

## 001 — Foundation stack

**Status:** Decided · 2026-10-07

- Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript 5 (strict).
- Tailwind CSS 4 (CSS-first config in `src/app/globals.css`, no `tailwind.config`).
- shadcn/ui 4 with the `base-nova` style, Lucide icons.
- npm as the package manager (ships with Node; no extra tooling).
- Node.js 24 LTS, installed via nvm.

## 002 — shadcn/ui primitives: Base UI

**Status:** Decided (reversible cheaply until we add more components) · 2026-10-07

shadcn/ui now lets you choose the underlying primitive library: Base UI, Radix, or React Aria. We use the shadcn default, **Base UI** (`@base-ui/react`).

- Why: it is shadcn's current default, so docs and registry examples match what we have installed. It comes from the team behind Radix and Material UI.
- Tradeoff: Radix has a longer track record and more community examples. Switching now is cheap (only `button` is installed); it gets more expensive with every component we add.

## 003 — Next.js Cache Components left enabled

**Status:** Decided · 2026-10-07

`create-next-app` 16.4 enables `cacheComponents` and `partialPrefetching` by default. We keep them.

- The builder is primarily a client-side interactive experience, so this has little impact now.
- When server data arrives (accounts, saved documents), data fetching is dynamic by default and caching is opt-in via `use cache`.

## 004 — Motion deferred

**Status:** Decided · 2026-10-07

Motion is part of the approved stack but is **not installed yet**. Nothing in the foundation animates. It will be added with the first feature where motion meaningfully improves the experience.

## 005 — Repository structure

**Status:** Decided · 2026-10-07

```
src/
├── app/                  Routes, layouts, global CSS (design tokens)
├── components/
│   ├── ui/               shadcn/ui primitives, restyled to our design system
│   ├── document/         Shared document-editing building blocks (any document type)
│   ├── editor/           The editor panel (forms, line-item table)
│   ├── preview/          Live preview shell (paper, zoom, mobile preview mode)
│   └── templates/        Visual templates — pure renderers of document data
├── lib/
│   ├── calculations/     Pure, deterministic totals (line, subtotal, discount, tax, grand total)
│   ├── money/            Money representation, rounding, currency formatting
│   ├── documents/        Document-type definitions (invoice now; quote, receipt… later)
│   ├── pdf/              PDF generation (later)
│   └── utils.ts          Shared helpers (shadcn `cn`)
├── types/                Domain types: Business, Client, Document, DocumentItem, Template…
└── data/                 Static data: currencies, sample/demo documents
docs/
├── PRD.md
├── PRODUCT_DECISIONS.md
└── DESIGN_SYSTEM.md
```

Deviations from the originally proposed structure, and why:

- **`components/invoice/` → `components/document/`.** Invoice-specific naming would pull the codebase toward an invoice-only implementation. Shared editing pieces are document-generic; anything truly invoice-specific is expressed as configuration in `lib/documents/`.
- **`lib/currency/` + `lib/tax/` → `lib/money/` + `lib/calculations/`.** Currency handling (minor units, rounding, formatting) is a single concern: money. Tax and discount are just steps in the totals calculation, so they live in `calculations/` until tax rules become complex enough to justify their own module.
- **`lib/utils/` → `lib/utils.ts`.** shadcn generates `lib/utils.ts`; a sibling `utils/` folder would create an ambiguous import path.
- **Added `lib/documents/`.** This is where document types are defined, so new types (quote, receipt) are added as data and configuration, not as new code paths.

## 006 — Templates consume the same document data

**Status:** Decided (principle; implementation pending) · 2026-10-07

From the PRD: a template is a pure function of document data plus branding options. It contains no state and no calculations. The live preview and the eventual PDF renderer read the same document object and the same computed totals. The exact rendering approach for PDF is still an open decision (see below).

---

## Open decisions (to resolve before building the invoice builder)

These are tracked here so they are not decided silently.

- **Money representation:** integer minor units (e.g. cents) vs. a decimal library.
- **PDF generation approach:** browser print vs. client-side PDF library vs. server-side rendering.
- **Builder state & persistence for guests:** in-memory only vs. local browser storage.
- **Dark mode scope:** app chrome only, or not at all for v1. The invoice "paper" itself always renders light.
- **Test runner:** add Vitest alongside the first calculation functions.
