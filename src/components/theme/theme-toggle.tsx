"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

import { getBrowserStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

import { applyTheme, THEME_KEY } from "./theme";

const DEVICE_DARK = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(window.document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => window.document.documentElement.classList.contains("dark");

function storedChoice(): string | null {
  try {
    return getBrowserStorage().getItem(THEME_KEY);
  } catch {
    return null;
  }
}

/**
 * Light / dark switch. Until the visitor chooses, the page follows the
 * device setting (live); once they choose, the choice is remembered. The
 * invoice itself never changes — its paper belongs to its template.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  // Follow the device while there's no explicit choice.
  useEffect(() => {
    const device = window.matchMedia(DEVICE_DARK);
    const onChange = () => {
      if (!storedChoice()) applyTheme(device.matches);
    };
    device.addEventListener("change", onChange);
    return () => device.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next = !isDark();
    try {
      getBrowserStorage().setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // Storage full: the theme still switches for this visit.
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A quiet crossfade where the browser supports it; otherwise instant.
    if (!reduced && "startViewTransition" in window.document) {
      window.document.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn(
        "relative flex size-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {/* Icons swap by CSS, so the first paint is right before React runs. */}
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}
