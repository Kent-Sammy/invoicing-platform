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
- **Paper (placeholder values):** white paper, zinc-based ink, muted ink and rules.
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
- **Decided (PRD):** the invoice document is **always** a white paper document and is never themed.
- **Current state:** tokens exist for light and `.dark` (class-based). There is no theme toggle yet.

## Print

- The document is designed for **A4**. On screen it renders at 210mm width, and the live preview is the PDF.
- App chrome must carry `print:hidden`. Wrappers around the document must not constrain its width in print.
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
