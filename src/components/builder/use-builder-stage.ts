"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The three moments of creating an invoice. Orientation, not a wizard:
 * every stage reads and writes the same document, and moving between
 * stages never changes it.
 */
export type BuilderStage = "template" | "create" | "ready";

export const BUILDER_STAGES: readonly BuilderStage[] = ["template", "create", "ready"];

function stageFromUrl(): BuilderStage | null {
  const step = new URLSearchParams(window.location.search).get("step");
  return BUILDER_STAGES.find((stage) => stage === step) ?? null;
}

function urlFor(stage: BuilderStage): string {
  const url = new URL(window.location.href);
  url.searchParams.set("step", stage);
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * The current stage, kept in the URL (`?step=`) so Back/Forward move
 * between stages and a reload stays put. `resolve` turns a requested stage
 * into an allowed one (e.g. Ready needs a complete invoice) and picks the
 * starting stage when the URL has none.
 */
export function useBuilderStage(resolve: (requested: BuilderStage | null) => BuilderStage) {
  // The builder only renders in the browser (after the draft loads).
  const [stage, setStage] = useState<BuilderStage>(() => resolve(stageFromUrl()));

  useEffect(() => {
    window.history.replaceState(null, "", urlFor(stage));
    // Only on mount: later changes push their own history entries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPopState = () => setStage(resolve(stageFromUrl()));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [resolve]);

  const goTo = useCallback((next: BuilderStage) => {
    setStage(next);
    window.history.pushState(null, "", urlFor(next));
    window.scrollTo(0, 0);
  }, []);

  return [stage, goTo] as const;
}
