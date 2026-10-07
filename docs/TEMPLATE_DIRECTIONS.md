# Template Directions

Status: **Exploration**, 2026-10-07. Design direction for the six templates, following decisions 024 and 025. Nothing here is built yet.
Companion to `TEMPLATE_ARCHITECTURE.md` (structure and rules) and the references in `docs/template references/`.

**Principle:** the references inspire the visual language; they never dictate the data model. Every direction below uses only what the product already supports.

---

## 1. Rendering foundation: full-bleed paper (spiked)

Coloured or dark paper and edge artwork have to reach the page edges in the PDF, across multiple pages, while content keeps its 18mm margins. Three approaches were tested in headless Chrome 155 with a 60-row, 3-page document:

| Approach | Result |
| --- | --- |
| Current: `@page { margin: 18mm }` + page background | ✗ Colour stops 18mm short of every edge (white border on all pages). Edge artwork is clipped. `position: fixed` artwork repeats on every page and **covers content**. |
| `@page { margin: 0 }` + one wrapper with `padding: 18mm; box-decoration-break: clone` | ✓ Colour to every edge on all pages. Every page gets its own top and bottom margin. Corner artwork appears on page 1 only and doesn't overlap rows. |
| `@page { margin: 0 }` + a frame `<table>` whose repeating `thead`/`tfoot` spacer rows create per-page margins | ✓ Identical result. The long-established cross-browser technique. |

**Recommendation:** move the page frame to `@page { margin: 0 }` with internal margins. Use the `box-decoration-break` version if Safari and Firefox print it correctly, otherwise the spacer-table version. The check is part of the groundwork. This is a page-frame change only: templates never handle margins themselves, and Minimal looks the same.

Artwork rules this implies:
- **Page-1 artwork:** absolutely positioned within the first page.
- **Every-page artwork** (e.g. a Playful edge strip): drawn by the frame's background layer, never `position: fixed`.

---

## 2. What templates can work with

Templates are designed around this inventory. Anything not listed doesn't exist in v1.

| Available | Notes |
| --- | --- |
| Title, number, issue date, due date | Number is free text (e.g. `KDS-2026-001`). |
| Business: name, logo (any shape), email, phone, address, country, tax ID | Logo may be missing; fall back to a wordmark of the name. |
| Client: name, email, address, phone, tax ID | Usually only name and email. |
| Line items: description, quantity, unit price, amount | **Descriptions can be multi-line.** A template may style the first line as the item name and later lines as detail (the "sub-item" look in the Editorial reference, using existing data). Row numbers (01, 02…) may be shown; they're presentational. |
| Summary rows, total, inclusive-tax breakdown | Order and wording fixed. |
| Payment: bank transfer, Pay invoice link, QR code | Any combination, or none. |
| Notes, terms | Free text, may be long. |
| Brand colour (optional), logo | The only user styling. With **no colour chosen**, each template uses its own designed default accent; a chosen colour is applied as the template decides, never automatically as the whole page (decision 025). |

**Seen in references but not supported, so not designed for:** signature, subject or project line, per-line discounts and struck-through prices, payment status ("PAID"), barcodes, icons with field labels as data, a hosted "Pay now" bar (that's a future shareable-invoice page, not a template).

**Never render fake functional marks:** no decorative barcodes, sample QR codes or fake signatures. Clients may try to use them.

---

## 3. Typography system (decided, 025)

| Family | Role |
| --- | --- |
| **Bricolage Grotesque** (variable: weight 200–800, optical size 12–96, width 75–100) | The document sans in every template. Optical size keeps body text calm and display text expressive from one family. |
| **Newsreader** (variable serif: weight 200–800, optical size 6–72, italics) | Second voice in Editorial and Elegant only. |
| Geist | App UI only; no longer used in documents. |

| Template | Fonts | How |
| --- | --- | --- |
| Minimal | **Geist (unchanged)** | Stays on its current typography until a migration is reviewed (decision 026) |
| Professional | Bricolage | Semibold headings; dense regular body |
| Traditional | Bricolage | Regular and semibold only; tracked uppercase labels; no display extremes |
| Playful | Bricolage | Extra-bold, wide display; regular body |
| Editorial | Bricolage + Newsreader | Bricolage extra-bold for the wordmark and display words; Newsreader for descriptions, notes and terms (magazine voice) |
| Elegant | Newsreader + Bricolage | Newsreader light at large size for the title; Bricolage for captions, table and figures |

All templates use tabular figures for amounts. Load both families with `subsets: ["latin", "latin-ext"]` (₦ lives in latin-ext; verified present in both families). The PDF action waits for `document.fonts.ready`.

---

## 4. The six directions

Every template defines a **default accent**, used when no brand colour is chosen, and states exactly where a chosen brand colour goes.

### 4.1 Minimal

- **Character:** quiet, typographic, contemporary. The default.
- **References:** the layout of `elegant-01/02` on white; essentially today's Minimal.
- **Paper:** white. **Edge colour:** none. **Artwork:** none.
- **Layout:** as built: wordmark or logo top left, title and number top right; Bill to / From / dates; amount-due band; table; totals; payment; notes; footer.
- **Type:** Geist, unchanged (decision 026). **Default accent:** ink (`#171717`).
- **Brand colour:** title and pay button.

### 4.2 Professional

- **Character:** structured, confident, corporate without being dated. Probably the most-chosen template for Nigerian SMEs.
- **References:**
  - *Take:* `sample 5`'s structure (header block, labelled sections, strong table header, totals bar); `Sample 6`'s gridded table and clear label/value pairs.
  - *Leave:* diagonal bands, slogan filler, offset tags, signature line.
- **Paper:** white or very light warm off-white. **Edge colour:** none; a header block sits inside the margins. **Artwork:** none.
- **Layout:**
  - Header block: logo and business details on the left; "INVOICE", number and dates as a label/value grid on the right.
  - Bill to / From in two boxed columns.
  - A full-grid table with column rules, its header filled with the accent.
  - Right-aligned totals grid with an accent-filled total row.
  - Bordered payment panel; notes and terms beneath.
- **Type:** Bricolage. **Default accent:** deep slate blue.
- **Brand colour:** table header fill, total row fill (`onBrand` text), section rules.

### 4.3 Traditional (original design, no reference)

- **Character:** conventional business stationery: familiar, trustworthy, conservative. Feels right to an accountant and to a long-standing corporate client.
- **Paper:** white. **Edge colour:** none. **Artwork:** rules only. Strong horizontal rules carry the structure.
- **Composition, top to bottom:**
  1. **Structured header** over a heavy rule (1.5pt, accent):
     - left: logo (or the business name as a wordmark), then business name, address, phone, email and tax ID in small type;
     - right: "INVOICE" (Bricolage semibold, tracked uppercase, about 20pt), and beneath it a bordered metadata grid: number, issue date, due date, amount due.
  2. **From / Bill to:** two equal columns with tracked uppercase captions (the shared labels), split by a hairline vertical rule.
  3. **Conventional table:** # / Description / Qty / Unit price / Amount. A 1pt ink rule above and below the header row, hairlines between rows, a 1pt closing rule.
  4. **Totals:** a right-aligned label/value list; the grand total has a single rule above and a **double rule below** (the accounting convention).
  5. **Payment information:** a bordered panel, with bank transfer details on the left and the Pay invoice link plus QR on the right (whichever are enabled).
  6. **Notes and terms** in small type.
  7. **Signature area:** "Authorised signature" line, right-aligned. Per decision 024 it **collapses entirely while there's no signature data**, which means always in v1. The composition is designed to be complete without it.
  8. **Footer:** a centred line of business contact details between hairlines.
- **Type:** Bricolage regular and semibold only; 9pt body, tracked uppercase 7pt captions; nothing larger than the title.
- **Default accent:** deep navy.
- **Brand colour:** title, heavy header rule and total rules only, darkened automatically for contrast. Restraint is the point.

### 4.4 Playful

- **Character:** joyful, graphic, energetic. For creatives, small brands, hospitality, events.
- **References:** `playful-04` (best fit: white content area, Bauhaus edge strip, total pill); `playful-01-organic` (organic shapes, rounded table panel); `playful-03-bold` and `sample 4` (chunky display type, total as hero); `playful-02-receipt` (numbered rows, dotted dividers).
- **Paper:** white or a light tint. **Edge colour:** an edge strip or corner motifs only; content sits on calm paper.
- **Artwork:** a template-owned motif set (SVG half-circles, pills, quarter-arcs, dots) in a **fixed palette** (025). The brand colour never recolours the motifs.
- **Layout:**
  - Huge display title (Bricolage extra-bold, wide).
  - A relaxed two-column parties block.
  - Numbered item rows (01, 02) with dotted dividers.
  - The total in a rounded pill as the focal point; a prominent "Scan to pay" QR.
- **Type:** Bricolage throughout. **Default accent:** the palette's primary (violet).
- **Brand colour:** the primary accent only (title and total pill), contrast-checked against the paper.

### 4.5 Editorial

- **Character:** design-studio, Swiss and type-led. For agencies, studios and freelancers who want to be noticed.
- **References:** `Editorial -001`. Take the colour-field page, the giant wordmark, right-aligned "INVOICE", the big "PAYMENT" heading with QR, dense small print and the 4-column footer.
- **Paper:** **acid lime, full-bleed**: the template's signature, used whenever no brand colour is chosen.
- **Artwork:** typographic only: oversized wordmark, brackets around real values (`[7 Oct 2026]`, `[#INV-0001]`), heavy rules.
- **Layout:**
  - The business name as a giant auto-fitted wordmark across the top; a small logo beside it when one exists.
  - A thin meta row (date, client, number) with "INVOICE" right-aligned.
  - Items with a bold first description line and indented detail lines.
  - Deliberate whitespace, then totals; "PAYMENT" as a large heading with bank details and QR; small-print terms; a 4-column business footer.
- **Type:** Bricolage extra-bold for the wordmark and display words; Newsreader for descriptions, notes and terms.
- **Brand colour (when chosen):** applied to display words and the rule system, never automatically to the whole page (025). If it can't reach contrast on lime, those elements fall back to ink. *To review visually once built:* whether a chosen brand colour should instead switch the paper to a neutral so the brand colour can lead.

### 4.6 Elegant

- **Character:** cinematic, premium, calm. For consultants, luxury and creative services.
- **References:** `elegant-01/02`. Take the dark paper, luminous abstract header, small refined captions, large "INVOICE" title, three-column header and quiet table. Leave the script signature and the floating "Pay now" bar.
- **Paper:** near-black or charcoal, full-bleed.
- **Artwork:** an abstract gradient band across the top of page 1 (vector SVG/CSS).
  - **No brand colour:** the template's own cool-blue and ember palette, after the references.
  - **Brand colour chosen:** the band is generated from it, framed by the template's neutral highlights.
- **Layout:**
  - Header artwork, then the logo (dark logos get a light chip).
  - A large Newsreader light "Invoice" title with the number.
  - From / Bill to / dates; hairline table; right-aligned totals; small-caption payment, notes and terms; the QR on a white plate.
- **Type:** Newsreader for the title (and optional italic accents); Bricolage for everything else.
- **Brand colour:** header artwork and pay button; `brandText` lightened for dark paper.

---

## 5. Summary

| | Minimal | Professional | Traditional | Playful | Editorial | Elegant |
| --- | --- | --- | --- | --- | --- | --- |
| Paper | White | White / off-white | White | White / tint | Acid lime | Dark |
| Full-bleed | – | – | – | Motif only | Whole page | Whole page |
| Artwork | – | – | Rules | Fixed-palette motifs | Typographic | Gradient band |
| Fonts | Geist (baseline) | Bricolage | Bricolage | Bricolage | Bricolage + Newsreader | Newsreader + Bricolage |
| Default accent (no brand) | Ink | Slate blue | Navy | Violet (palette) | Ink on lime | Cool blue / ember |
| Chosen brand colour goes to | Title, button | Table header, total | Header rule, title, total rules | Title, total pill | Display words, rules | Artwork, button |
| New platform needs | – | – | – | Frame | Frame, wordmark fitting | Frame, dark tokens, QR plate |

## 6. Build order (decided, 026)

0. **Groundwork:** done (see decision 026).
1. **Minimal:** existing baseline, unchanged.
2. **Playful:** built (`4ff4b52`).
3. **Professional:** built (`4ff4b52`).
4. **Traditional:** built (`521ba4a`).
5. **Editorial:** built; lime paper stays when a brand colour is chosen (the colour goes to display words and rules). Awaiting review.
6. Elegant.

Each template ships with the contract test and the sandbox fixture set: short, multi-page, inclusive tax, all payment options, no / square / wide logo, all-placeholder, and with and without a brand colour.

## 7. Open questions

All questions from the previous round were answered in decision 025. One item is left to judge visually when Editorial is built: whether a chosen brand colour should switch Editorial's paper to a neutral (§4.5).
