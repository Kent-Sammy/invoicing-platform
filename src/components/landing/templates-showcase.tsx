"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SafeDocumentRenderer } from "@/components/preview/safe-document-renderer";
import { A4_SIZE, ScaledDocument } from "@/components/preview/scaled-document";
import { TEMPLATE_CATALOG } from "@/components/templates/registry";
import { cn } from "@/lib/utils";
import type { TemplateId } from "@/types/template";

import { showcaseDocument } from "./demo-documents";
import { SHOW_TEMPLATE_EVENT } from "./footer-links";

const COUNT = TEMPLATE_CATALOG.length;
const DESKTOP = "(min-width: 1024px)";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The same invoice in each of the six real templates, rendered by the
 * product's own renderer — the colour on this page comes from here.
 *
 * Desktop: the showcase pins while the page scrolls through it, stepping
 * through the templates; clicking (or arrow keys) scrolls to that template,
 * so scroll position and selection always agree. Phones: a row of chips.
 */
export function TemplatesShowcase() {
  const [selected, setSelected] = useState<TemplateId>(TEMPLATE_CATALOG[0].id);
  const [document] = useState(() => showcaseDocument());
  const track = useRef<HTMLDivElement>(null);
  // While a click scrolls the page to a template, scroll doesn't drive the
  // selection (so the templates in between don't flash past).
  const scrollingTo = useRef<number | null>(null);
  const current = TEMPLATE_CATALOG.find((entry) => entry.id === selected)!;

  /** The page scroll position at which a template is shown. */
  const scrollTopFor = (index: number) => {
    const element = track.current!;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.offsetHeight - window.innerHeight;
    return top + ((index + 0.5) / COUNT) * distance;
  };

  const choose = useCallback((index: number) => {
    setSelected(TEMPLATE_CATALOG[index].id);
    if (!window.matchMedia(DESKTOP).matches || !track.current) return;
    const top = scrollTopFor(index);
    scrollingTo.current = top;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    // Safety net in case the scroll is interrupted before it arrives.
    window.setTimeout(() => {
      if (scrollingTo.current === top) scrollingTo.current = null;
    }, 1200);
  }, []);

  // Footer template links: show that template here.
  useEffect(() => {
    const onShow = (event: Event) => {
      const index = TEMPLATE_CATALOG.findIndex((entry) => entry.id === (event as CustomEvent<TemplateId>).detail);
      if (index < 0) return;
      if (window.matchMedia(DESKTOP).matches) {
        choose(index);
      } else {
        setSelected(TEMPLATE_CATALOG[index].id);
        track.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      }
    };
    window.addEventListener(SHOW_TEMPLATE_EVENT, onShow);
    return () => window.removeEventListener(SHOW_TEMPLATE_EVENT, onShow);
  }, [choose]);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    let frame = 0;

    const update = () => {
      frame = 0;
      const element = track.current;
      if (!element || !desktop.matches) return;
      if (scrollingTo.current !== null) {
        if (Math.abs(window.scrollY - scrollingTo.current) > 4) return;
        scrollingTo.current = null;
      }
      const distance = element.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -element.getBoundingClientRect().top / distance));
      setSelected(TEMPLATE_CATALOG[Math.min(COUNT - 1, Math.floor(progress * COUNT))].id);
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // Desktop: a tall track the showcase stays pinned in (half a screen of scroll per template).
    <div ref={track} className="lg:h-[400vh]">
      <div data-reveal className="lg:sticky lg:top-0 lg:flex lg:h-dvh lg:items-center">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div
            role="tablist"
            aria-label="Templates"
            onKeyDown={(event) => {
              // Arrow keys move between templates, as in any tab list.
              const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
              if (!step) return;
              event.preventDefault();
              const index = TEMPLATE_CATALOG.findIndex((entry) => entry.id === selected);
              const next = (index + step + COUNT) % COUNT;
              choose(next);
              window.document.getElementById(`template-tab-${TEMPLATE_CATALOG[next].id}`)?.focus({ preventScroll: true });
            }}
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible"
          >
            {TEMPLATE_CATALOG.map((entry, index) => {
              const active = entry.id === selected;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  id={`template-tab-${entry.id}`}
                  aria-selected={active}
                  aria-controls="template-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => choose(index)}
                  className={cn(
                    "group flex shrink-0 items-baseline gap-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-page-fg/30",
                    // Phones: a row of quiet chips. Desktop: an editorial index.
                    "rounded-full border px-3.5 py-1.5 lg:rounded-none lg:border-0 lg:border-t lg:px-0 lg:py-5 lg:last:border-b",
                    active ? "border-page-fg text-page-fg lg:border-page-line" : "border-page-line text-page-dim hover:text-page-fg",
                  )}
                >
                  <span className="hidden font-mono text-[11px] tracking-[0.18em] lg:inline">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[15px] font-medium lg:text-[34px] lg:leading-none lg:tracking-[-0.02em]">
                    {entry.name}
                  </span>
                  <span
                    className={cn(
                      "ml-auto hidden text-[13px] transition-opacity lg:inline",
                      active ? "text-page-faint opacity-100" : "opacity-0",
                    )}
                  >
                    {entry.description}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            id="template-panel"
            role="tabpanel"
            aria-labelledby={`template-tab-${selected}`}
            // Desktop: sized so the whole pinned sheet fits the screen.
            className="mx-auto w-full max-w-[560px] lg:max-w-[min(560px,calc((100dvh-6rem)*0.7071))]"
          >
            <div
              key={selected}
              className="animate-in shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_32px_64px_-32px_rgba(0,0,0,0.4)] duration-500 fade-in-0 motion-reduce:animate-none"
            >
              <ScaledDocument reserve={A4_SIZE}>
                <SafeDocumentRenderer
                  document={{ ...document, branding: { ...document.branding, templateId: selected } }}
                  printable={false}
                />
              </ScaledDocument>
            </div>
            <p className="mt-4 text-center text-[13px] text-page-faint lg:hidden">{current.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
