"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** A4 at 96 CSS px per inch: the sheet's natural size. */
export const A4_SIZE = { width: (210 / 25.4) * 96, height: (297 / 25.4) * 96 };

interface ScaledDocumentProps {
  children: ReactNode;
  maxScale?: number;
  /**
   * The content's natural size. When given, its scaled height is reserved
   * from the first paint (before measuring), so nothing below shifts as it
   * loads; content taller than this (e.g. a second page) still grows.
   */
  reserve?: { width: number; height: number };
}

/**
 * Scales the real-size A4 sheet to the container's width, up to `maxScale`
 * on large screens. Purely visual: print ignores it (see `.document-scaler`).
 */
export function ScaledDocument({ children, maxScale = 1, reserve }: ScaledDocumentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ scale: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return;

    const measure = () => {
      // Hidden (e.g. mobile preview closed): nothing to measure yet.
      if (container.clientWidth === 0 || page.offsetWidth === 0) return;
      const scale = Math.min(maxScale, container.clientWidth / page.offsetWidth);
      setSize({ scale, width: page.offsetWidth * scale, height: page.offsetHeight * scale });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(page);
    return () => observer.disconnect();
  }, [maxScale]);

  // Before measuring: hidden, and — when a size is reserved — taking no
  // height of its own, so the reserved space alone sets the layout.
  const unmeasured: CSSProperties = reserve
    ? { visibility: "hidden", height: 0, overflow: "hidden" }
    : { visibility: "hidden" };

  return (
    <div ref={containerRef} className="w-full" style={reserve ? { display: "grid" } : undefined}>
      {reserve && (
        <div
          aria-hidden
          style={{
            gridArea: "1 / 1",
            justifySelf: "center",
            width: `min(100%, ${reserve.width * maxScale}px)`,
            aspectRatio: `${reserve.width} / ${reserve.height}`,
          }}
        />
      )}
      <div
        className="document-scaler mx-auto"
        style={{
          ...(size ? { width: size.width, height: size.height } : unmeasured),
          ...(reserve && { gridArea: "1 / 1" }),
        }}
      >
        <div
          ref={pageRef}
          className="document-scaler w-max"
          style={{ transform: `scale(${size?.scale ?? 1})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
