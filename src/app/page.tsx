import type { Metadata } from "next";

import {
  DetailsSection,
  FaqSection,
  FinalCta,
  Hero,
  HowItWorksSection,
  LandingFooter,
  LandingNav,
  LivePreviewSection,
  TemplatesSection,
} from "@/components/landing/landing-sections";
import { onest } from "@/components/landing/fonts";
import { RevealObserver } from "@/components/landing/reveal-observer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Beautiful invoices. In about a minute.` },
  description: "Create, customize, and download a professional invoice without signing up.",
};

export default function Home() {
  return (
    <div className={`landing min-h-dvh ${onest.variable}`}>
      <LandingNav />
      <main>
        <Hero />
        <LivePreviewSection />
        <TemplatesSection />
        <HowItWorksSection />
        <DetailsSection />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
      <RevealObserver />
    </div>
  );
}
