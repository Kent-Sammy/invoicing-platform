"use client";

import type { ReactNode } from "react";

import type { TemplateId } from "@/types/template";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Event the template showcase listens for: show this template. */
export const SHOW_TEMPLATE_EVENT = "landing:show-template";

const LINK = "text-white/65 transition-colors outline-none hover:text-white focus-visible:text-white";

/** A footer link that takes the visitor to the showcase with this template chosen. */
export function TemplateLink({ id, children }: { id: TemplateId; children: ReactNode }) {
  return (
    <a
      href="#templates"
      className={LINK}
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent<TemplateId>(SHOW_TEMPLATE_EVENT, { detail: id }));
      }}
    >
      {children}
    </a>
  );
}

/** A footer link that opens one FAQ answer and brings it into view. */
export function FaqLink({ id, children }: { id: string; children: ReactNode }) {
  return (
    <a
      href={`#faq-${id}`}
      className={LINK}
      onClick={(event) => {
        const answer = window.document.getElementById(`faq-${id}`);
        if (!(answer instanceof HTMLDetailsElement)) return;
        event.preventDefault();
        answer.open = true;
        answer.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
        window.history.replaceState(null, "", `#faq-${id}`);
      }}
    >
      {children}
    </a>
  );
}

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
      className="landing-button inline-flex items-center gap-1.5 text-white/50 outline-none hover:text-white focus-visible:text-white"
    >
      Back to top
      <span aria-hidden className="landing-button-arrow inline-block -rotate-90">
        →
      </span>
    </button>
  );
}
