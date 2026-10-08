"use client";

import { useEffect, useRef, type RefObject } from "react";

import { BuilderHeader } from "@/components/builder/builder-header";
import { CreateFooter } from "@/components/builder/create-footer";
import { PreviewPane } from "@/components/builder/preview-pane";
import { useDocument } from "@/components/document/document-provider";
import { InvoiceEditor } from "@/components/editor/invoice-editor";
import { SafeDocumentRenderer } from "@/components/preview/safe-document-renderer";
import { ScaledDocument } from "@/components/preview/scaled-document";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";

import { DemoDocumentProvider } from "./demo-provider";
import { HERO_ITEMS, heroEndDocument, heroStartDocument } from "./demo-documents";

const FRAME = { width: 1200, height: 760 };
const noop = () => {};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Distance from `element` down to `ancestor`'s content top, in layout pixels. */
function offsetWithin(element: HTMLElement, ancestor: HTMLElement): number {
  let top = 0;
  for (let node: HTMLElement | null = element; node && node !== ancestor; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
  }
  return top;
}

/**
 * Plays the product once: the client is typed, two items are added and VAT
 * is switched on — real reducer actions, so the real preview updates live.
 * Then it rests. Skipped entirely when the visitor prefers reduced motion.
 */
function useHeroScript(container: RefObject<HTMLDivElement | null>, editor: RefObject<HTMLDivElement | null>) {
  const { dispatch } = useDocument();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const highlight = (selector: string | null) => {
      const root = container.current;
      if (!root) return;
      root.querySelectorAll("[data-demo-active]").forEach((el) => el.removeAttribute("data-demo-active"));
      if (!selector) return;
      const targets = root.querySelectorAll<HTMLElement>(selector);
      targets.forEach((el) => el.setAttribute("data-demo-active", ""));
      // Keep the active field comfortably in view inside the editor column.
      const scroller = editor.current;
      const field = [...targets].find((el) => scroller?.contains(el));
      if (scroller && field) {
        scroller.scrollTo({ top: Math.max(0, offsetWithin(field, scroller) - 140), behavior: "smooth" });
      }
    };

    const type = async (text: string, apply: (value: string) => void) => {
      for (let length = 1; length <= text.length; length++) {
        if (cancelled) return;
        apply(text.slice(0, length));
        await sleep(42 + Math.random() * 40);
      }
    };

    const fillItem = async (index: number) => {
      const id = `hero-${index}`;
      const item = HERO_ITEMS[index];
      highlight(`[aria-label="Item ${index + 1} description"], [data-demo="item"]`);
      await type(item.description, (description) => dispatch({ type: "updateItem", id, changes: { description } }));
      if (item.quantity !== 1) {
        highlight(`[aria-label="Item ${index + 1} quantity"]`);
        await sleep(300);
        dispatch({ type: "updateItem", id, changes: { quantity: item.quantity } });
      }
      highlight(`[aria-label="Item ${index + 1} price"]`);
      await type(String(item.unitPrice / 100), (digits) =>
        dispatch({ type: "updateItem", id, changes: { unitPrice: Number(digits) * 100 } }),
      );
    };

    (async () => {
      // After the hero has assembled (the product finishes rising at ~1.25s).
      await sleep(1700);
      highlight('[id="client-name"], [data-demo="client"]');
      await type("Harbour & Co.", (name) => dispatch({ type: "updateClient", changes: { name } }));
      await sleep(250);
      highlight('[id="client-email"]');
      await type("accounts@harbour.co", (email) => dispatch({ type: "updateClient", changes: { email } }));
      await sleep(350);
      await fillItem(0);
      if (cancelled) return;
      await sleep(350);
      dispatch({ type: "addItem", item: { id: "hero-1", description: "", quantity: 1, unitPrice: 0 } });
      await sleep(250);
      await fillItem(1);
      if (cancelled) return;
      await sleep(500);
      highlight('[id="tax-enabled"]');
      await sleep(400);
      dispatch({ type: "updateTax", changes: { enabled: true } });
      await sleep(1400);
      if (!cancelled) highlight(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [container, editor, dispatch]);
}

/** Desktop: the real Create stage — header, editor, live preview and footer. */
function BuilderFrame({ editor }: { editor: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[14px] bg-background text-foreground ring-1 ring-black/[0.07] dark:ring-white/10"
      style={{ width: FRAME.width, height: FRAME.height }}
    >
      <BuilderHeader stage="create" onStage={noop} exported={false} />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[400px] shrink-0 flex-col border-r">
          <div ref={editor} className="relative min-h-0 flex-1 overflow-y-hidden">
            <InvoiceEditor onChooseTemplate={noop} />
          </div>
          <CreateFooter onReview={noop} onPreview={noop} />
        </div>
        <PreviewPane open={false} onClose={noop} />
      </div>
    </div>
  );
}

/** Phones and tablets: the real invoice, with the fields being typed floating over it. */
function SheetComposition() {
  const { document, totals } = useDocument();
  const item = document.items.findLast((entry) => entry.description !== "") ?? document.items[0];

  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-10">
      <div className="aspect-[210/297] overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_24px_48px_-24px_rgba(0,0,0,0.35)]">
        <ScaledDocument>
          <SafeDocumentRenderer document={document} showPlaceholders printable={false} />
        </ScaledDocument>
      </div>
      <div className="absolute inset-x-4 bottom-0 space-y-2.5 rounded-xl bg-background p-3.5 text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_16px_32px_-16px_rgba(0,0,0,0.3)] sm:inset-x-8">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">Client</p>
          <Input readOnly tabIndex={-1} value={document.client.name} placeholder="Who is this invoice for?" data-demo="client" />
        </div>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] text-muted-foreground">Item</p>
            <Input readOnly tabIndex={-1} value={item.description} placeholder="What did you provide?" data-demo="item" />
          </div>
          <p className="pb-1.5 text-[13px] font-medium tabular-nums">
            {formatMoney(totals.lineTotals[item.id] ?? 0, document.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroProductInner() {
  const container = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  useHeroScript(container, editor);

  return (
    <div ref={container} className="hero-product">
      <div className="hidden lg:block">
        <div className="relative mx-auto w-full max-w-[1200px]" style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}` }}>
          <div className="absolute inset-0 shadow-[0_40px_80px_-40px_rgba(11,11,12,0.35)] rounded-[14px]">
            <ScaledDocument>
              <BuilderFrame editor={editor} />
            </ScaledDocument>
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <SheetComposition />
      </div>
    </div>
  );
}

/**
 * The hero visual: the real invoice builder, rendered by the product's own
 * components and renderer, playing out an invoice being created. Purely
 * illustrative — inert, hidden from assistive tech, and it stores nothing.
 */
export function HeroProduct() {
  return (
    <div inert aria-hidden className="pointer-events-none font-sans select-none">
      <DemoDocumentProvider
        document={() => (prefersReducedMotion() ? heroEndDocument() : heroStartDocument())}
        fallback={
          <>
            <div className="hidden lg:block">
              <div className="mx-auto w-full max-w-[1200px]" style={{ aspectRatio: `${FRAME.width} / ${FRAME.height}` }} />
            </div>
            {/* Same footprint as SheetComposition: the sheet plus the card's overhang. */}
            <div className="mx-auto max-w-[460px] pb-10 lg:hidden">
              <div className="aspect-[210/297]" />
            </div>
          </>
        }
      >
        <HeroProductInner />
      </DemoDocumentProvider>
    </div>
  );
}
