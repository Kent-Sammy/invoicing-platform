"use client";

import { useEffect } from "react";

/**
 * Turns on scroll reveals for the landing page: marks the page as ready
 * (which hides not-yet-seen [data-reveal] blocks, see landing.css) and
 * reveals each block once as it enters the viewport. Renders nothing.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".landing");
    if (!root || !("IntersectionObserver" in window)) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-group]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    // Anything already on screen (e.g. after a reload mid-page) simply stays
    // visible; only content still to come is held back for its reveal.
    targets.forEach((target) => {
      if (target.getBoundingClientRect().top < window.innerHeight) target.setAttribute("data-revealed", "");
      else observer.observe(target);
    });
    root.setAttribute("data-reveal-ready", "");
    return () => observer.disconnect();
  }, []);

  return null;
}
