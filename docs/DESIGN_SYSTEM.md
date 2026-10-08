# Design System

Our visual system, built on top of shadcn/ui. shadcn provides accessible behaviour (via Radix) and structure; **the visual language is ours**.

This document records only decisions that have actually been made. Sections marked _Not yet decided_ are intentionally empty. Fill them as the product owner makes decisions; do not invent values.

**Sources of truth:**

- `src/app/globals.css` — app (UI chrome) tokens, light and dark
- `src/app/document.css` — document (paper) tokens and print rules

## Principles

From the PRD. The product should feel closer to Linear, Stripe, Vercel, Notion, Framer, and Raycast.

Avoid:

- Generic AI-generated SaaS aesthetics
- Bootstrap or old-accounting-software feel
- Dense enterprise dashboards
- Excessive cards, gradients, or shadows
- Random or decorative animation

shadcn/ui defaults are a **starting point**, not the final styling.

## Two token layers

The app and the document are styled independently.

| Layer | Where | Themed? | Used by |
| --- | --- | --- | --- |
| **App tokens** (`background`, `foreground`, `primary`, `muted`, `border`, `ring`, …) | `globals.css` `:root` / `.dark` | Yes: light + dark | Editor, navigation, controls, settings, app chrome |
| **Document tokens** (`doc-paper`, `doc-ink`, `doc-ink-muted`, `doc-rule`, `doc-brand`) | `document.css` on `.document-page` | **Never** | Templates only |

Rules:

- Components use **semantic tokens**, never raw colour values.
- Templates use **only** `doc-*` tokens (`text-doc-ink`, `border-doc-rule`, `text-doc-brand`, …), never app tokens. This is what keeps the invoice white in dark mode.
- `doc-brand` is set per document from the user's brand colour.

## Typography

- **Decided:** Geist Sans for UI text and Geist Mono for monospaced text, loaded via `next/font/google` in `src/app/layout.tsx`. Exposed as `font-sans`, `font-heading` and `font-mono`.
- **Decided:** amounts in tables use tabular figures (`tabular-nums`) so columns align.
- _Not yet decided:_ app type scale, weights, line heights.
- _Not yet decided:_ typography inside each template. Templates are expected to define their own type treatments, in `pt` for print fidelity.

## Colors

- **App palette (placeholder):** shadcn `neutral` in OKLCH.
- **Paper:** each template owns its paper and ink tokens (white, tinted, coloured or dark), per decision 024. Minimal uses white paper with zinc-based ink.
- **Decided (PRD):** the user's brand colour applies to the document only, never to the app UI.
- _Not yet decided:_ final app palette and accent colour.

## Spacing

- **Current state:** Tailwind's default 4px-based spacing scale.
- **Decided:** document page margin is 18mm (`--doc-margin` and `@page`; both must change together). This value is a placeholder until template design.
- _Not yet decided:_ app layout rhythm, panel padding, form density.

## Border radius

- **Current state (placeholder):** shadcn base radius `--radius: 0.625rem`, with derived `sm` through `4xl` steps.
- _Not yet decided:_ final radius scale.

## Shadows

- **Decided (PRD):** use shadows sparingly.
- _Not yet decided:_ elevation scale, including how the paper sheet sits on the canvas in the preview.

## Components

- **Foundation:** shadcn/ui (`radix-nova` style, Radix primitives) in `src/components/ui/`. Components are copied into the repo, so we own and restyle them.
- **Installed:** `Button`.
- **Rule:** add shadcn components only when a feature needs them, and restyle them to this system when we add them.
- **Icons:** Lucide (`lucide-react`).

## Interaction patterns

- **Decided (PRD):** the live preview updates immediately on every edit. There is no "preview" step or page.
- **Decided:** guest work autosaves silently, 400ms after the last change. Resetting the draft is an explicit user action.
- **Decided (PRD):** use Motion only where it improves usability or adds subtle polish. No flashy animation in the editor.
- _Not yet decided:_ focus styles, hover and pressed states, transitions and durations, loading and empty states, save-status indicator.

## Dark mode

- **Decided (PRD):** dark mode applies to app chrome only (editor, navigation, controls, settings).
- **Decided:** the app's dark mode never affects the invoice. The invoice's paper belongs to its template (decision 024): Elegant may be dark and Editorial coloured, whatever the app theme.
- **Theme switching (2026-10-08):** light and dark across the landing page and the builder.
  - The device setting is followed until the visitor chooses; the choice is stored as `nuhmera:theme`.
  - A script in `<head>` (`components/theme/theme.ts`) sets `.dark` before the first paint, so there's no flash.
  - `ThemeToggle` (a moon/sun switch) sits in the landing nav and the builder header, and crossfades with the View Transitions API where it's supported and motion is allowed.
- **Landing in dark:** theme-aware page tokens (`bg-page`, `text-page-fg`, `text-page-muted`, `border-page-line`…) defined in `landing.css`, with a moonlit version of the mist. The final CTA and footer stay dark in both themes, with a hairline separating the CTA in dark. The demos show the real builder in its dark theme.

## Print

- The document is designed for **A4**. On screen it renders at 210mm width, and the live preview matches the PDF exactly.
- **The print source is separate from the preview:** `PrintDocumentRoot` renders the same document, hidden on screen and shown only in print. The scaled or hidden preview never prints, so printing works whether or not the preview was ever opened (decision 027).
- App chrome must carry `print:hidden`. Wrappers around the document must not constrain its width in print.
- **Text safety (page layer):** `.document-page` sets `overflow-wrap: anywhere`, so long emails, URLs and codes wrap inside their column. Right-aligned `td`/`th`/`dd` cells (numbers) never break, and adjacent numeric columns keep a 2.5mm minimum gap. Templates don't need their own overflow handling.
- **Before printing:** "Save / Print PDF" lives in the Ready stage, which is reachable only once the invoice has a business name, a client, an item with a description and an invoice number (decision 028).
- Helpers: `document-keep-together` keeps a block on one page; `document-page-break` starts a new page.
- Table headers repeat on each printed page, and rows never split across pages. Totals, payment details and notes each stay on one page.
- **Decided (v1):** no page numbers, and no page-break markers in the live preview. Browser print headers and footers are left to the user's print settings.

## Document content rules

- All dates on the document use the **business locale**. All money uses the **currency's** native format (₦, $, £, €).
- Tax-exclusive tax appears as a row above the total. Tax-inclusive tax appears as a quiet breakdown under the total: "VAT (7.5%) included", then Net and VAT.
- Payment details print only the fields the user filled in.
- Logos render from a processed raster (at most 1200px, WebP). The template controls display size.

## Responsive behavior

From the PRD:

| Breakpoint | Layout |
| --- | --- |
| Desktop | Editor and live preview side by side |
| Tablet | Adaptive split view |
| Mobile | Single-column editing with an easy Preview mode. Intentionally designed, not a shrunk desktop. |

- _Not yet decided:_ exact breakpoints, the mobile preview mechanism (toggle, sheet, or tab), and how the A4 sheet scales to fit narrow preview panes.

## Invoice journey (decision 028)

- **Header:** product name · stepper (1 Template · 2 Create · 3 Ready; phones show only the current step's label) · autosave status · New. There's no Save or Print button in the header.
- **Template:** full-width page titled "How should your invoice look?" over the six live cards (3 columns, 2 on phones). A footer shows the selected template and **Continue →**.
- **Create:** the editor and live preview, with a footer pinned under the editor showing the total and **Review invoice →**. While it's disabled, a one-line hint says what's missing. On phones the same footer adds an icon Preview button.
- **Ready:** a 360px panel (check, "Your invoice is ready", number · client · due date, total, **Save / Print PDF**, the print-dialog hint, **Copy payment link** when there is one, Edit invoice, Start a new invoice) beside the invoice at hero size, exactly as it prints. On phones the panel sits above the invoice.

## Invoice builder (v1 refinement, 2026-10-07)

- **Layout:** the builder lives at `/create` (`/` redirects there until a landing page exists).
  - Desktop (≥1024px): editor (400–420px) | live preview on the `canvas` workspace. The preview is the visual hero; the A4 sheet scales to fill its pane, up to 1.25×.
  - Below 1024px: single-column editor with a pinned total and a **Preview** button that opens the document full-screen as a modal dialog. Focus moves to Close and returns on exit, the page behind is inert, and Escape closes it.
- **Editor hierarchy:** Your business → Client → Invoice → **Items** (focal section, tinted; tax, discount and total sit under the subtotal) → Payment → Appearance (template and brand colour) → Notes & terms.
  - Section labels are small uppercase captions; controls are 32px tall with 13px text (16px on mobile so iOS doesn't zoom).
  - Progressive disclosure: only essential fields are visible. Secondary fields sit behind quiet "+ Add …" links (contact details, tax information, address & phone). Payment and Notes collapse to a single line until opened. Anything with existing content opens automatically.
- **Placeholders:** empty fields show marked sample content (grey, dotted underline) in the preview so it never looks broken. Sample content never prints.
- **Logo:** sized by aspect ratio at a constant visual area (`logoSize`), so square marks and wide wordmarks carry equal weight. The editor's logo tile takes the logo's shape.
- **Paper:** the sheet is rectangular, with a hairline edge and a soft shadow on the canvas. Never a rounded card.
- **No tooling UI:** the Next.js dev indicator is disabled (`devIndicators: false`).
- **Item descriptions:** multi-line. The first line is the item name; Shift + Enter adds a detail line printed beneath it. Enter adds the next item on desktop. On touch keyboards, Enter starts a new line.
- **Limits:** amounts over 999,999,999,999.99 per line, or quantities over 1,000,000, show an inline message under the row and aren't applied.
- **Errors:** a render failure is contained. A preview that can't render shows a calm notice and retries on the next edit; the builder itself has a recovery screen.
- **Save status:** "Saved in this browser" (an icon on phones), "Not saved" when storage is full, or "Not saved in this browser" when the browser blocks storage.
- **Brand colour:** in Appearance, the row shows the swatch and its name ("Template default", a preset name or the hex value). Change opens a popover with template default, nine presets, a custom colour picker and a hex field. Changes apply to the preview immediately.

## Template gallery (2026-10-07)

- **Entry:** the Template stage, and Appearance → Template → Change while creating (the gallery takes over the editor column; Done returns to Appearance).
- **Gallery:** takes over the editor column while open, so the live preview stays visible and updates on every selection. "Done" returns to the editor. The editor/preview split is unchanged.
- **Cards:** a large live thumbnail (the user's own invoice rendered by the real template; sample content when empty), then the name and a short subtext. 3 columns when the column is at least 22rem wide, otherwise 2 (container query).
- **States:** 1px border; hover strengthens the border; selected = foreground border plus a small check.
- **Thumbnails:** built templates render live, with sample content shown in the template's real styling (not the grey sample treatment) so their identity reads at a glance. All six templates are built, so every card renders live; the interim direction sketches and "Soon" tags have been removed. A future template appears in the gallery only once it's built and in the registry.
- **Source of truth:** `TEMPLATE_CATALOG` in `components/templates/registry.ts`. Thumbnails are inert, hidden from assistive tech, and never affect printing.
- **Selecting** changes only `branding.templateId`, which is autosaved with the draft.
