# Product Requirements — Invoice Platform

Owner: Product designer / product owner
Status: Foundation phase (no product features built yet)

## 1. Product context

We are building a premium, design-led invoice and business-document platform.

**Core promise:** Create a beautiful, professional invoice in under 60 seconds.

The first and most important experience is a **guest-first invoice builder**.

### Target flow

The user should eventually be able to:

1. Create invoice
2. Enter business details
3. Enter client details
4. Add line items
5. Automatically calculate totals
6. See a live invoice preview
7. Choose a template
8. Customize branding
9. Generate PDF
10. Download

No account should be required for the basic invoice creation experience.

## 2. Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Motion — only where it meaningfully improves the experience

Use current stable versions that work well together. Do not add unnecessary dependencies.

## 3. UI quality

This is a premium, design-led product.

The interface should feel closer to:

- Linear
- Stripe
- Vercel
- Notion
- Framer
- Raycast

It should NOT feel like:

- Generic AI-generated SaaS
- Bootstrap
- Old accounting software
- Dense enterprise dashboards
- Excessive cards
- Excessive gradients
- Excessive shadows
- Random animations

shadcn/ui is the component foundation, but its default visual styling must not simply be used everywhere. We establish our own design system on top of it (see `DESIGN_SYSTEM.md`).

## 4. Core differentiator: live preview

The invoice builder MUST have a live preview.

**Desktop layout:** `EDITOR | LIVE INVOICE PREVIEW`

The preview must update immediately when the user changes:

- Business information
- Client information
- Invoice information
- Line items
- Prices
- Tax
- Discount
- Currency
- Template
- Brand color
- Logo

There is no separate "Preview page" workflow. The live preview is one of the core product differentiators.

## 5. Document architecture

The application is designed around a **reusable document system**, not an invoice-specific implementation.

### Core entities

- Business
- Client
- Document
- DocumentItem
- Template
- Payment
- Receipt

### Future document types

- Invoice
- Quote
- Estimate
- Proforma Invoice
- Receipt

These are NOT all implemented now. The architecture must allow them to be added later without rebuilding the application.

## 6. Calculations

Financial calculations must be centralized and deterministic.

Reusable functions are required for:

- Line item total
- Subtotal
- Discount
- Tax
- Grand total

Requirements:

- No calculation logic directly inside UI components.
- Money calculations must avoid floating-point precision issues.
- Calculation functions must be unit testable.

## 7. Templates

Templates are a core part of the product. Eventual set:

1. Minimal
2. Playful
3. Professional
4. Traditional
5. Editorial
6. Elegant

(Revised 2026-10-07: Modern and Bold were dropped. "Bold" is a visual technique any template may use, not a template.)

Not all six are built initially. First, establish an architecture where multiple templates consume the same document data without duplicating the invoice implementation.

The live preview and the eventual PDF renderer must be based on the same document data.

## 8. Responsive design

- **Desktop:** Editor + Preview side by side.
- **Tablet:** Adaptive split view.
- **Mobile:** Single-column editing with an easy Preview mode.

Do not simply shrink the desktop interface. Mobile must be intentionally designed.

## 9. Guest-first scope — explicitly out of scope for now

- Authentication
- Supabase
- Payments
- Paystack, Flutterwave, Stripe
- Email sending
- Client portals
- Analytics
- Subscriptions
- AI features
- Marketing landing page

The product experience comes first.

## 10. Locked product decisions (2026-10-07)

These are recorded in detail in `PRODUCT_DECISIONS.md`.

- **Money:** stored as integer minor units (kobo, cents). Deterministic rounding; tax is rounded once to the currency's minor unit.
- **PDF:** the HTML/CSS preview is the PDF. "Download PDF" uses browser print / Save as PDF for now. No separate PDF renderer. Preview and PDF must match.
- **Guest persistence:** the draft autosaves to the browser and restores on refresh, and can be reset. No authentication. No payment credentials are stored.
- **Dark mode:** applies to the app UI only. It never changes the invoice.
- **Template visual freedom (revised 2026-10-07):** each template owns its paper (white, tinted, coloured or dark), may use edge-to-edge colour when that's part of its identity, and may include built-in decorative artwork. Users customise only the logo, brand colour, business information and invoice data. There is no visual editor. Rendering is optimised for screen and PDF; there is no separate print-friendly theme yet.
- **Brand colour is optional (2026-10-07):** with no colour chosen, each template uses its own designed default. A chosen colour is applied however the template sees fit, never automatically as the whole page.
- **Document fonts:** Bricolage Grotesque (all templates) and Newsreader (Editorial, Elegant). Geist stays the app UI font.
- **Reference designs inspire the visual language but never dictate the data model.** No signature or subject fields for now; a template may reserve a signature area only if it collapses when there's no signature data.
- **Testing:** Vitest for business logic.
- **Currencies:** NGN (default), USD, GBP, EUR, defined as configuration.
- **Tax:** invoice-level, user enables it and sets the rate. Nigeria suggests VAT 7.5%, which is a suggestion, not tax advice. Prices can be tax-exclusive or tax-inclusive.
- **UI:** shadcn/ui + Radix + Tailwind, Lucide icons, Motion only for usability and subtle polish.
- **Name:** "Invoice Platform" is a temporary internal name, defined in one place.
- **State:** no Redux. One source of truth for the current document.
- **Due date:** defaults to issue date + 14 days. It is shown and editable, with room for presets later.
- **Numbering:** automatic (INV-0001, INV-0002, … via a local guest sequence) and editable (e.g. KDS-2026-001). Server-side numbering comes with accounts.
- **Dates:** follow the business country and locale (default Nigeria, en-NG), independent of currency.
- **Print:** no page numbers in v1. Browser headers and footers are left to the user. No page-break markers in the preview, but documents may span multiple pages.
- **Payment details:** an optional section with bank name, account name, account number and instructions. It is display text the business chooses to print, not a payment credential.
- **Logos:** stored as assets and referenced from the draft. Guest assets live in the browser, processed under these limits:
  - original uploads up to about 2 MB;
  - compressed to about 500 KB, WebP, transparency preserved;
  - SVGs sanitised before use.

## 11. Working agreement

- The product designer / product owner owns product decisions.
- Engineering does not silently make major product decisions.
- Architectural decisions with meaningful tradeoffs are explained before proceeding and recorded in `PRODUCT_DECISIONS.md`.
- Do not over-engineer. Prefer simple, maintainable solutions.
