# Design System

Our visual system, built on top of shadcn/ui. shadcn provides accessible behaviour and structure; **the visual language is ours**.

This document records only decisions that have actually been made. Sections marked _Not yet decided_ are intentionally empty. Fill them as the product owner makes decisions; do not invent values.

**Source of truth for tokens:** `src/app/globals.css` (Tailwind 4 `@theme` + CSS variables).

## Principles

From the PRD. The product should feel closer to Linear, Stripe, Vercel, Notion, Framer, and Raycast.

Avoid:

- Generic AI-generated SaaS aesthetics
- Bootstrap or old-accounting-software feel
- Dense enterprise dashboards
- Excessive cards, gradients, or shadows
- Random or decorative animation

shadcn/ui defaults are a **starting point**, not the final styling.

## Typography

- **Decided:** Geist Sans for UI text and Geist Mono for monospaced text, loaded via `next/font/google` in `src/app/layout.tsx`. Exposed as `font-sans`, `font-heading` and `font-mono`.
- _Not yet decided:_ type scale, weights, line heights, numeric styling for amounts (e.g. tabular figures).
- _Not yet decided:_ typography inside invoice templates. Templates are expected to define their own type treatments.

## Colors

- **Current state (placeholder):** the shadcn `neutral` palette in OKLCH, via semantic tokens (`background`, `foreground`, `primary`, `muted`, `border`, `ring`, …).
- Components must use **semantic tokens**, never raw color values, so the palette can be replaced without touching components.
- **Decided (PRD):** users can set a brand color that applies to the invoice document. This is separate from the app's own UI palette.
- _Not yet decided:_ final app palette, accent color, and whether dark mode is in scope for v1.

## Spacing

- **Current state:** Tailwind's default 4px-based spacing scale.
- _Not yet decided:_ layout rhythm, panel padding, form density.

## Border radius

- **Current state (placeholder):** shadcn base radius `--radius: 0.625rem`, with derived `sm` through `4xl` steps.
- _Not yet decided:_ final radius scale.

## Shadows

- **Decided (PRD):** use shadows sparingly.
- _Not yet decided:_ elevation scale.

## Components

- **Foundation:** shadcn/ui (`base-nova` style, Base UI primitives) in `src/components/ui/`. Components are copied into the repository, so we own and restyle them.
- **Installed:** `Button`.
- **Rule:** add shadcn components only when a feature needs them, and restyle them to this system when we add them.
- **Icons:** Lucide (`lucide-react`).

## Interaction patterns

- **Decided (PRD):** the live preview updates immediately on every edit. There is no "preview" step or page.
- **Decided (PRD):** use Motion only where it meaningfully improves the experience. No decorative animation.
- _Not yet decided:_ focus styles, hover and pressed states, transitions and durations, loading and empty states.

## Responsive behavior

From the PRD:

| Breakpoint | Layout |
| ---------- | ------ |
| Desktop | Editor and live preview side by side |
| Tablet | Adaptive split view |
| Mobile | Single-column editing with an easy Preview mode. Intentionally designed, not a shrunk desktop. |

- _Not yet decided:_ exact breakpoints, and the mobile preview mechanism (toggle, sheet, or tab).
