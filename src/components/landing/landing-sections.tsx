import { ArrowRight } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { PaymentQr } from "@/components/templates/kit";
import { TEMPLATE_CATALOG } from "@/components/templates/registry";
import { NuhmeraLogo } from "@/components/brand/nuhmera-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";
import { createQrCode } from "@/lib/payments";
import { cn } from "@/lib/utils";

import { BackToTop, FaqLink, TemplateLink } from "./footer-links";
import { HeroProduct } from "./hero-product";
import { LiveDemo } from "./live-demo";
import { TemplatesShowcase } from "./templates-showcase";

const CREATE_HREF = "/create";

function Eyebrow({ children, className, ...props }: { children: ReactNode; className?: string; "data-reveal"?: boolean }) {
  return (
    <p className={cn("font-mono text-[11px] tracking-[0.22em] uppercase", className)} {...props}>
      {children}
    </p>
  );
}

function Display({
  children,
  className,
  tracking = "tracking-[-0.025em]",
  weight = "font-semibold",
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  /** Letter-spacing class; the hero sets its own, tighter value. */
  tracking?: string;
  /** Font-weight class; the hero sets its own, lighter value. */
  weight?: string;
  as?: "h1" | "h2";
}) {
  return <Tag className={cn("font-display text-balance", weight, tracking, className)}>{children}</Tag>;
}

function PrimaryCta({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href={CREATE_HREF}
      className={cn(
        "landing-button landing-button-primary inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium outline-none focus-visible:ring-3",
        inverted
          ? "bg-paper text-ink hover:bg-white focus-visible:ring-white/40"
          : "bg-page-fg text-page focus-visible:ring-page-fg/30",
      )}
    >
      Create an invoice <ArrowRight className="landing-button-arrow size-4" />
    </Link>
  );
}

function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("px-4 py-24 sm:px-6 sm:py-32", className)}>
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}

export function LandingNav() {
  return (
    <header className="px-4 sm:px-6">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between">
        <Link href="/" aria-label={`${siteConfig.name} home`} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-page-fg/30">
          <NuhmeraLogo className="h-[22px] w-auto" decorative />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-page-muted hover:bg-page-fg/5 hover:text-page-fg" />
          <Link
            href={CREATE_HREF}
            className="landing-button landing-button-outline rounded-full border border-page-line-strong bg-page px-4 py-1.5 text-[13px] font-medium"
          >
            Create an invoice
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* 01 — Hero */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-12 sm:px-6 sm:pt-16">
      <div className="mx-auto max-w-[760px] text-center">
        <Eyebrow className="landing-enter landing-enter-eyebrow text-page-faint">Invoice Platform</Eyebrow>
        <Display as="h1" weight="font-medium" tracking="tracking-[-0.04em]" className="landing-enter landing-enter-headline mt-5 text-[clamp(38px,7.5vw,88px)] leading-[0.92]">
          {/* One sentence per line at every width. */}
          <span className="block">Beautiful invoices.</span> <span className="block">In about a minute.</span>
        </Display>
        <p className="landing-enter landing-enter-text mx-auto mt-6 max-w-[460px] text-[17px] leading-relaxed text-page-muted">
          Create, customize, and download a professional invoice without signing up.
        </p>
        <div className="landing-enter landing-enter-cta mt-8 flex flex-col items-center gap-4">
          <PrimaryCta />
          <p className="text-[13px] text-page-faint">Free · No sign-up · Takes about a minute</p>
        </div>
      </div>
      <div className="relative mx-auto mt-14 max-w-[1200px] pb-16 sm:mt-16 sm:pb-24">
        <div aria-hidden className="landing-mist" />
        <div className="landing-enter landing-enter-product relative">
          <HeroProduct />
        </div>
      </div>
    </section>
  );
}

/* 02 — Live Preview */
export function LivePreviewSection() {
  return (
    <Section id="live-preview">
      <div data-reveal className="max-w-[640px]">
        <Eyebrow className="text-page-faint">Live preview</Eyebrow>
        <Display className="mt-5 text-[clamp(36px,5.5vw,64px)] leading-[1.02]">
          <span className="hidden lg:inline">Type on the left. Watch it appear on the right.</span>
          <span className="lg:hidden">Type above. Watch it appear below.</span>
        </Display>
        <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-page-muted">
          Every change shows on the invoice the moment you make it. Totals, tax and layout take care
          of themselves.
        </p>
      </div>
      <div data-reveal className="mt-14">
        <LiveDemo />
      </div>
    </Section>
  );
}

/* 03 — Templates */
export function TemplatesSection() {
  return (
    <Section id="templates" className="border-t border-page-line-soft">
      <div data-reveal className="max-w-[640px]">
        <Eyebrow className="text-page-faint">Templates</Eyebrow>
        <Display className="mt-5 text-[clamp(36px,5.5vw,64px)] leading-[1.02]">
          One invoice. Six ways to look exceptional.
        </Display>
        <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-page-muted">
          The same details, set six different ways. Switch any time — your content never changes.
        </p>
      </div>
      {/* The showcase reveals itself (it pins on desktop). */}
      <div className="mt-14">
        <TemplatesShowcase />
      </div>
    </Section>
  );
}

/* 04 — How It Works */
const STEPS = [
  { number: "01", title: "Choose", text: "Pick your style." },
  { number: "02", title: "Create", text: "Add your details and watch it come together." },
  { number: "03", title: "Ready", text: "Download, print or share." },
];

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="border-t border-page-line-soft">
      <Eyebrow data-reveal className="text-page-faint">
        How it works
      </Eyebrow>
      <ol data-reveal-group className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((step, index) => (
          <li
            key={step.number}
            // 25px = the former 1px border + 24px padding, so nothing moves.
            className="landing-step relative pt-[25px]"
            style={{ "--reveal-index": index } as CSSProperties}
          >
            {/* The step's rule: a full line at rest, a loader while hovered. */}
            <span aria-hidden className="absolute inset-x-0 top-0 h-px overflow-hidden bg-page-fg/12">
              <span className="landing-step-line block h-full bg-page-fg" />
            </span>
            <span className="font-mono text-[12px] tracking-[0.2em] text-page-faint">{step.number}</span>
            <p className="mt-3 font-display text-[40px] leading-none font-semibold tracking-[-0.02em]">{step.title}</p>
            <p className="mt-3 max-w-[260px] text-[15px] leading-relaxed text-page-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* 05 — The Details That Matter */
const QR = { code: createQrCode("https://paystack.com/pay/your-business"), caption: "Scan to pay", display: "" };

const DETAILS: { title: ReactNode; label: string; text: string; visual?: ReactNode }[] = [
  {
    label: "VAT",
    title: "VAT, inclusive or exclusive",
    text: "Add tax on top of your prices or show it included in them, at any rate — calculated exactly.",
  },
  {
    label: "Currencies",
    title: <span className="font-display text-[34px] font-medium tracking-[0.06em]">₦ $ £ €</span>,
    text: "Naira, dollars, pounds and euros, each written the way it should be.",
  },
  { label: "Bank details", title: "Bank details", text: "Your account details, printed clearly — only the fields you fill in." },
  {
    label: "Payment links",
    title: "Payment links",
    text: "Paste your Paystack, Flutterwave or Stripe link and it becomes a Pay button in the PDF.",
  },
  {
    label: "QR codes",
    title: "QR codes",
    text: "Printed copies get a code your client can scan and pay from their phone.",
    visual: <PaymentQr qr={QR} className="size-14 shrink-0" />,
  },
  {
    label: "Branding",
    title: "Logo + brand colour",
    text: "Your logo on every template, and your colour — applied the way each design intends.",
  },
  { label: "PDF", title: "A4 PDF", text: "A true A4 page, ready to print or save as a PDF straight from your browser." },
  { label: "Autosave", title: "Autosave", text: "Every change is saved as you go. There's no save button to remember." },
];

export function DetailsSection() {
  return (
    <Section id="details" className="border-t border-page-line-soft">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div data-reveal>
          <Eyebrow className="text-page-faint">The details</Eyebrow>
          <Display className="mt-5 text-[clamp(36px,5vw,56px)] leading-[1.02]">The details that matter.</Display>
          <p className="mt-5 max-w-[360px] text-[16px] leading-relaxed text-page-muted">
            The things that make an invoice correct, professional and easy to pay — handled for you.
          </p>
        </div>
        <dl data-reveal-group className="grid sm:grid-cols-2 sm:gap-x-10">
          {DETAILS.map((detail, index) => (
            <div
              key={detail.label}
              // 25px = the former 1px border + 24px padding, so nothing moves.
              className="landing-detail relative flex items-start justify-between gap-4 pt-[25px] pb-6"
              style={{ "--reveal-index": index } as CSSProperties}
            >
              {/* A hairline at rest; drawn in ink while the row is hovered. */}
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-page-line">
                <span className="landing-detail-line block h-full bg-page-fg" />
              </span>
              <div>
                <dt className="text-[16px] font-medium">{detail.title}</dt>
                <dd className="mt-1.5 max-w-[320px] text-[14px] leading-relaxed text-page-muted">{detail.text}</dd>
              </div>
              {detail.visual && <div aria-hidden>{detail.visual}</div>}
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/* 06 — FAQ */
const FAQ = [
  {
    id: "free",
    q: "Is it really free?",
    a: "Yes. There's no account to create, no trial and no card details — open the builder and make your invoice.",
  },
  {
    id: "sign-up",
    q: "Do I need to sign up?",
    a: "No. Everything works without an account. You'll go straight to choosing a template.",
  },
  {
    id: "data",
    q: "Where is my information kept?",
    a: "Your current draft and business details are saved in this browser on this device. Clearing your browser data removes them, so save each finished invoice as a PDF.",
  },
  {
    id: "pdf",
    q: "How do I get a PDF?",
    a: "When your invoice is ready, choose Save / Print PDF. Your browser's print dialog opens — select “Save as PDF” as the destination.",
  },
  {
    id: "vat",
    q: "Can I add VAT?",
    a: "Yes. Set any rate and choose whether your prices exclude tax (it's added on top) or already include it.",
  },
  {
    id: "phone",
    q: "Does it work on my phone?",
    a: "Yes. The builder is designed for phones as well as larger screens, with the full invoice a tap away.",
  },
];

export function FaqSection() {
  return (
    <Section id="faq" className="border-t border-page-line-soft">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div data-reveal>
          <Eyebrow className="text-page-faint">FAQ</Eyebrow>
          <Display className="mt-5 text-[clamp(36px,5vw,56px)] leading-[1.02]">Questions, answered.</Display>
        </div>
        <div data-reveal className="border-b border-page-line">
          {FAQ.map((item) => (
            <details key={item.q} id={`faq-${item.id}`} className="group scroll-mt-24 border-t border-page-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-page-fg/30 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="relative size-3 shrink-0 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-current after:transition-transform group-open:after:scale-y-0"
                />
              </summary>
              <p className="max-w-[560px] pb-6 text-[15px] leading-relaxed text-page-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* 07 — Final CTA */
export function FinalCta() {
  return (
    <section className="landing-night relative overflow-hidden px-4 py-32 text-paper sm:px-6 sm:py-44 dark:border-t dark:border-white/10">
      <div data-reveal className="relative mx-auto max-w-[760px] text-center">
        <Display className="text-[clamp(44px,7vw,84px)] leading-[0.98]">Your next invoice, in about a minute.</Display>
        <div className="mt-10 flex flex-col items-center gap-4">
          <PrimaryCta inverted />
          <p className="text-[13px] text-white/50">Free · No sign-up</p>
        </div>
      </div>
    </section>
  );
}

/* 08 — Footer */
const FOOTER_PRODUCT = [
  { label: "Live preview", href: "#live-preview" },
  { label: "Templates", href: "#templates" },
  { label: "How it works", href: "#how-it-works" },
  { label: "The details", href: "#details" },
];

const FOOTER_HELP = [
  { id: "pdf", label: "Saving a PDF" },
  { id: "data", label: "Where your data is kept" },
  { id: "vat", label: "Adding VAT" },
  { id: "phone", label: "Using it on your phone" },
];

/** The current year, cached for everyone and refreshed daily (Cache Components). */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <Eyebrow className="text-white/40">{title}</Eyebrow>
      <ul className="mt-5 space-y-3 text-[14px]">{children}</ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="overflow-hidden bg-ink px-4 text-[13px] text-white/50 sm:px-6">
      <div className="mx-auto max-w-[1200px] border-t border-white/10 pt-16 sm:pt-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="col-span-2 lg:col-span-1">
            <NuhmeraLogo className="h-6 w-auto text-white" />
            <p className="mt-3 max-w-[300px] text-[14px] leading-relaxed text-white/55">
              Beautiful invoices, in about a minute. Free, with no sign-up.
            </p>
            <Link
              href={CREATE_HREF}
              className="landing-button mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-white outline-none"
            >
              Create an invoice <ArrowRight className="landing-button-arrow size-3.5" />
            </Link>
          </div>
          <FooterColumn title="Product">
            {FOOTER_PRODUCT.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-white/65 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title="Templates">
            {TEMPLATE_CATALOG.map((template) => (
              <li key={template.id}>
                <TemplateLink id={template.id}>{template.name}</TemplateLink>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title="Help">
            <li>
              <Link href="#faq" className="text-white/65 transition-colors hover:text-white">
                FAQ
              </Link>
            </li>
            {FOOTER_HELP.map((link) => (
              <li key={link.id}>
                <FaqLink id={link.id}>{link.label}</FaqLink>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.name}. Drafts are saved in your browser — nothing is sent to a
            server.
          </p>
          <BackToTop />
        </div>
      </div>

      {/* The one flourish: the name, set huge and nearly invisible, running off the bottom edge. */}
      <div className="landing-wordmark mx-auto mt-14 max-w-[1200px] text-white/[0.07] select-none">
        <NuhmeraLogo className="w-full" decorative />
      </div>
    </footer>
  );
}
