# Template Architecture

Status: **Proposed**, updated 2026-10-07 for decision 024 (template lineup, template-owned paper, full-bleed, artwork). Template-by-template directions are in `TEMPLATE_DIRECTIONS.md`.
Scope: defines how templates are structured, what may vary between them, and what must stay identical. No templates are created by this document.

---

## 1. How the renderer works today

```
BusinessDocument ──► withPlaceholders ──► calculateTotals ──► createDocumentView ──► Template ──► DocumentPage (A4)
 (data, persisted)    (preview only)        (lib/calculations)   (lib/documents/view)   (React)      (document.css, print)
```

| Layer | File | Owns |
| --- | --- | --- |
| Document | `types/document.ts` | Raw data: parties, items, minor-unit amounts, options. Never seen by templates. |
| Placeholders | `lib/documents/placeholders.ts` | Sample content for empty fields, and which fields are sample. |
| Calculations | `lib/calculations/totals.ts` | Every number: line totals, discount, tax (inclusive/exclusive), total. |
| View model | `lib/documents/view.ts` | Display-ready content: formatted money and dates, labels, summary rows in order, tax breakdown, payment block (validated URL, QR matrix), logo with dimensions, placeholder flags. |
| Template | `components/templates/minimal/` | Layout and visual styling only. |
| Page frame | `components/preview/document-page.tsx`, `app/document.css` | A4 size, margins, paper colour tokens, brand variable, print rules, placeholder print-hiding. |
| Registry | `components/templates/registry.ts` | `TemplateId → { id, name, component }`, with fallback for unknown ids. |

### What already works in our favour

- **Templates are already pure.** They receive only `DocumentView`, so no template can calculate, format or validate anything differently. This is the most important property, and it holds.
- **The preview and PDF share one render path.** A new template automatically gets live preview, placeholders, mobile preview and print.
- **The document is isolated from the app theme** through `--doc-*` tokens. Since decision 024 the *values* of those tokens belong to each template.

### Coupling found in the current Minimal template

The Minimal file is 291 lines. Only part of it is "Minimal". The rest is behaviour every template would otherwise have to copy, and copied behaviour drifts:

| Inside `minimal-template.tsx` today | Really is | Risk if copied into each template |
| --- | --- | --- |
| `Line` (placeholder marking) and the `allSample` rule in `PartyBlock` | Shared behaviour | One template marks sample content wrongly, so sample text prints on a real invoice. |
| QR `<svg>` (black on white, quiet zone, crisp edges) | Shared behaviour | A styled QR (brand colour, too small) stops scanning. |
| Pay link (`target`, `rel`, href from the validated URL) | Shared behaviour | Loses `noopener`, or the button text drifts from "Pay invoice". |
| `logoSize()` call with fixed limits | Shared logic, variable limits | Inconsistent logo handling. |
| `document-keep-together` / `keep-with-previous` placement | Shared print rules | Totals or payment split across pages. |
| `min-h-[260mm]` (derived from the 18mm margin) | Page geometry | Hard-coded in a template; breaks if margins change. |
| 73 hard-coded mm/pt values; only 5 colour tokens | Theme | Every template restates the whole visual system. |

There are also platform gaps a second template would hit:

1. **Fonts:** `document.css` hard-codes Geist on the page, so a serif template (Editorial, Elegant) has nowhere to plug in.
2. **Brand colour:** it's a single raw value. Nothing computes a readable text colour on top of it. The "Pay invoice" button already has this contrast problem; a template using brand colour as a large fill (Editorial, Playful) would make it worse.
3. **Logo limits:** `logoSize` defaults are fixed. Centered or larger logo treatments can't be expressed.
4. **Margins:** the same 18mm value appears in three places (`--doc-margin`, `@page`, `260mm`), and CSS `@page` cannot read variables.

---

## 2. Architecture

Templates are split into four layers. Only the top layer differs between templates.

```
┌───────────────────────────────────────────────────────────────┐
│ Template            layout composition + theme tokens          │  ◄ varies
├───────────────────────────────────────────────────────────────┤
│ Document kit        shared building blocks with fixed           │  ◄ shared behaviour,
│                     behaviour and styleable surfaces            │    styleable look
├───────────────────────────────────────────────────────────────┤
│ View model + theme  all content, values, labels, visibility,     │  ◄ shared, computed once
│                     derived brand tokens                        │
├───────────────────────────────────────────────────────────────┤
│ Page frame          A4, margins, print rules, paper isolation    │  ◄ shared, fixed
└───────────────────────────────────────────────────────────────┘
```

### 2.1 Page frame (shared, fixed)

`DocumentPage` and `document.css` stay the only owners of:

- A4 size and the 18mm **content** margins, with the content-area height exposed as a token (`--doc-content-height`) instead of `260mm` hard-coded in templates;
- **the full-bleed frame:** `@page { margin: 0 }`, so the page surface can run edge to edge, with the 18mm margins recreated inside the document on *every* printed page (spiked; see `TEMPLATE_DIRECTIONS.md` §1). Templates draw their surface and artwork on the frame; they never change the margins;
- applying the template's surface tokens (paper, ink, rules), `color-scheme`, and colour preservation in print;
- page-break rules: table headers repeat, rows never split, keep-together blocks, footer never stranded;
- placeholder styling on screen and removal in print;
- preview scaling.

### 2.2 View model and theme (shared, computed once)

`createDocumentView` remains the single source of content. Two additions are proposed:

- **Block-level placeholder flags**, for example "this whole party block is sample". This moves the `allSample` rule out of the template.
- **`DocumentTheme`**: computed centrally from the template's surface tokens plus `branding.brandColor` (nullable since 025):
  - `brand`: the chosen colour, or the template's **default accent** when none is chosen;
  - `onBrand`: black or white text, whichever meets WCAG AA on `brand`;
  - `brandText`: the brand colour adjusted to be readable as text **on this template's paper** (darkened on light paper, lightened on dark paper);
  - `brandSubtle`: a tint or shade for fills and rules on this paper.

  Templates never compute colours themselves.

### 2.3 Document kit (shared behaviour, styleable look)

`components/templates/kit/` would hold the building blocks every template composes. Each kit component fixes behaviour and exposes styling through `className` slots, props for supported variants, and theme tokens:

| Kit component | Fixed behaviour | Template can vary |
| --- | --- | --- |
| `SampleText` | Placeholder marking; omitted in print | Typography |
| `PartyDetails` | Field order, which fields show, sample handling | Label visibility and style, alignment, emphasis of name |
| `LogoMark` | Aspect-aware sizing (`logoSize`), `object-contain`, fallback to wordmark | Placement (start / center / end), area and max box within bounds |
| `DocumentMeta` | Number, issue date, due date always present | Layout (list / inline / grid), alignment |
| `ItemsTable` | Columns, item order, numeric alignment, repeating header, unsplittable rows | Header style, rules (lined / zebra / borderless), row density, header fill |
| `TotalsBlock` | Summary row order, total emphasis, inclusive-tax breakdown placement, keep-together | Width, alignment, divider style, total size |
| `AmountDue` | Shows total and due date | Presentation (hero band / inline / boxed) |
| `PaymentBlock` → `BankDetails`, `PayButton`, `PaymentQr` | Validated URL, `target="_blank" rel="noopener noreferrer"`, "Pay invoice" text, QR black on a white plate with quiet zone, min 20mm, on **any** paper colour | Arrangement, button shape within limits (fill uses `brand` / `onBrand`) |
| `NotesBlock` | Notes and terms content | Layout |
| `DocumentFooter` | Content limited to business contact + document number | Style, whether shown |
| `SignatureArea` (reserved) | Renders nothing unless signature data exists (none in v1) | Placement |

### 2.4 Template (varies)

A template is a component plus a definition:

```ts
// Proposed contract — not implemented yet.
interface TemplateDefinition {
  id: TemplateId;                       // stable, persisted in drafts
  name: string;                         // "Minimal", "Editorial", …
  description: string;                  // one line for the template picker
  fonts: DocumentFontId[];              // from a curated, preloaded set
  surface: DocumentSurface;             // paper, ink, muted ink, rule, placeholder — owned by the template
  defaultAccent: string;                // used when no brand colour is chosen (025)
  component: ComponentType<TemplateProps>;  // layout + template-owned artwork
}

interface TemplateProps {
  view: DocumentView;                   // all content — unchanged
  theme: DocumentTheme;                 // derived brand tokens
}
```

The template decides arrangement and visual treatment by composing kit components. It renders no content that isn't in the view, and omits no content the view marks as required (see §3.2).

---

## 3. What may vary, and what must stay shared

### 3.1 May vary between templates

| Property | Range / limits |
| --- | --- |
| **Section arrangement** | Order and placement of header, parties, meta, amount due, payment, notes. Items always follow parties/meta, and totals always follow items. |
| **Header composition** | Logo or wordmark placement (start / center / end); title size, weight, case; number placement. |
| **Typography** | Font families from the curated set; type scale; weights; letter spacing; label case (uppercase eyebrows vs sentence case). Body text ≥ 8pt, secondary ≥ 7pt. |
| **Brand colour usage** | Which elements use `brand` / `brandText` / `brandSubtle`: title, rules, table header, amount-due band, pay button. Always through theme tokens. |
| **Paper and surface** | Any paper colour (white, tinted, coloured, dark), with ink, muted ink and rule tokens that keep contrast minimums on that paper (body text ≥ 7:1, muted text ≥ 4.5:1). |
| **Edge-to-edge colour** | Allowed when it is part of the template's identity, drawn on the full-bleed frame. Content still stays within the 18mm margins. |
| **Decorative artwork** | Template-owned shapes, motifs, typographic or abstract visuals, as vector (SVG/CSS). Not user-editable. Must not overlap content or imitate functional marks (fake barcodes, fake QR codes, fake signatures). |
| **Rules and surfaces** | Divider weight and presence; table style (lined / zebra / borderless); tinted bands inside the margins. |
| **Density** | Section spacing and row padding (compact / regular / airy). |
| **Logo box** | Visual area and max size, within page limits (max 70mm × 25mm). |
| **Amount-due emphasis** | Hero band, inline line, or boxed figure. |
| **Footer** | Shown or hidden; style. Content comes only from the kit. |

### 3.2 Must stay shared (identical in every template)

**Content and values: computed once, never in templates**
- Every amount, total, tax line, discount, net figure, and their formatting (currency locale, minor units, signs).
- Every date and number format (business locale).
- All wording: labels, titles, "Pay invoice", "Scan to pay", "VAT (7.5%) included". Copy belongs to the document type (and later to translations), not to templates.
- Summary row order, item order, item column set.

**Content that every template must render when present in the view**
- Document title and number, issue date, due date.
- Client name (and other client fields when given), business name (and fields when given).
- Every line item: description, quantity, unit price, amount.
- Every summary row, the total, and the inclusive-tax breakdown when present.
- The payment section when enabled: bank details, pay link and QR as configured.
- Notes and terms when given.

**Behaviour**
- Placeholder marking on screen and omission in print.
- Payment-link safety: only the validated URL, safe link attributes.
- QR legibility: black on a white plate, quiet zone, at least 20mm, on any paper.
- Logo aspect handling.
- Page geometry and all print and page-break rules.
- The document never follows the app's light/dark theme; its paper comes only from the template.
- Content always stays inside the 18mm margins, on every page; only surface colour and artwork may reach the page edge.
- Accessibility semantics: a real `<table>` for items, headings, `alt` and labels.

**Identity**
- `TemplateId`s are stable once shipped, because they're stored in drafts. An unknown id falls back to the default.
- Switching templates never changes document data. It changes only `branding.templateId`.

---

## 4. The six templates against this architecture

The lineup was revised by decision 024. Full direction briefs are in `TEMPLATE_DIRECTIONS.md`.

| Template | Paper | Edge colour | Artwork | Needs from the platform |
| --- | --- | --- | --- | --- |
| Minimal | White | No | None | Nothing new (refactor onto the kit) |
| Professional | White / off-white | No (header band within the margins) | None | Kit only |
| Traditional | White | No | Fine rules only | Serif font |
| Playful | White or tinted | Optional (edge motif) | Geometric / organic motifs | Display font; full-bleed frame |
| Editorial | Coloured | Yes (whole page) | Typographic treatment | Full-bleed frame; brand-as-paper contrast |
| Elegant | Dark | Yes (whole page) | Abstract gradient header generated from brand colour | Full-bleed frame; dark-paper tokens; QR plate |

## 5. Groundwork needed before the second template

These are refactors only, with no visual change to Minimal. Each is verified by rendering Minimal identically before and after.

1. **Extract the document kit** from `minimal-template.tsx` into `components/templates/kit/`, and rebuild Minimal on it.
2. **Move the block-level placeholder rule** into the view model.
3. **Add `DocumentTheme`** (`lib/documents/theme.ts`) with WCAG-based `onBrand` / `brandText`. Use it for the pay button now, which fixes the open contrast issue.
4. **Font tokens:** declare the curated families with `next/font` (only fonts actually used are downloaded) and expose `--doc-font-*`. The page font then comes from the template definition instead of hard-coded Geist.
5. **Page geometry and full-bleed frame:** add `--doc-content-height` and replace `min-h-[260mm]`. Switch to `@page { margin: 0 }` with per-page internal margins (technique chosen after a Safari/Firefox check; see `TEMPLATE_DIRECTIONS.md` §1). Move paper tokens into each template's `surface`.
6. **Extend `TemplateDefinition`** with `description` and `fonts`.
7. **Template contract test** (Vitest + `react-dom/server`): for every registered template, render a set of fixtures and assert every "must render" value from §3.2 appears in the output. The fixtures:
   - short invoice;
   - 48-line multi-page invoice;
   - inclusive tax;
   - all payment options;
   - no logo, square logo, wide logo;
   - all-placeholder draft.

   This makes "a template dropped a total" a failing test, not a support ticket.
8. **Sandbox:** add `/dev/document?template=<id>` for side-by-side visual and print checks across those fixtures.

---

## 6. Decisions

Resolved by decision 024 (2026-10-07):

- **Paper:** belongs to the template; no white-only rule.
- **Full-bleed:** allowed where it's part of a template's identity. The content margins stay fixed at 18mm.
- **Artwork:** template-owned, not user-editable.
- **Signature and subject:** not in the model.

Resolved by decision 025: brand colour is optional (`null` = each template's default accent); the Playful palette is fixed; fonts are Bricolage Grotesque (all templates) and Newsreader (Editorial, Elegant), assigned per `TEMPLATE_DIRECTIONS.md` §3.

Still open (current recommendations in brackets, assumed unless you say otherwise):

1. Can templates change wording? [No: copy stays with the document type.]
2. User-adjustable template options in v1? [No: fixed per template; only brand colour and logo vary.]
3. Low-contrast brand colours. [Automatically adjusted, never refused.]
