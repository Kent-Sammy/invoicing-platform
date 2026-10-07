"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scales the real-size A4 sheet to the container's width, up to `maxScale`
 * on large screens. Purely visual: print ignores it (see `.document-scaler`).
 */
export function ScaledDocument({ children, maxScale = 1 }: { children: ReactNode; maxScale?: number }) {
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

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="document-scaler mx-auto"
        style={size ? { width: size.width, height: size.height } : { visibility: "hidden" }}
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
