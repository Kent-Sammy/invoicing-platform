"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { BUILDER_STAGES, type BuilderStage } from "./use-builder-stage";

const LABELS: Record<BuilderStage, string> = {
  template: "Template",
  create: "Create",
  ready: "Ready",
};

/**
 * Where you are, not a gate: every step can be revisited, in any order.
 * Only Ready waits until the invoice has the minimum it needs.
 */
export function BuilderStepper({
  stage,
  readyEnabled,
  readyHint,
  onSelect,
}: {
  stage: BuilderStage;
  readyEnabled: boolean;
  readyHint: string;
  onSelect: (stage: BuilderStage) => void;
}) {
  const current = BUILDER_STAGES.indexOf(stage);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-1 sm:gap-2">
        {BUILDER_STAGES.map((step, index) => {
          const active = step === stage;
          const done = index < current;
          const disabled = step === "ready" && !readyEnabled && !active;
          return (
            <li key={step} className="flex items-center gap-1 sm:gap-2">
              {index > 0 && <span aria-hidden className="h-px w-3 bg-border sm:w-6" />}
              <button
                type="button"
                onClick={() => onSelect(step)}
                disabled={disabled}
                aria-current={active ? "step" : undefined}
                title={disabled ? readyHint : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-1.5 py-1 text-[12.5px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px] font-medium tabular-nums",
                    active ? "bg-foreground text-background" : "border border-border",
                    done && "border-foreground/30",
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={2.5} /> : index + 1}
                </span>
                {/* Phones show only the current step's label. */}
                <span className={cn(!active && "sr-only sm:not-sr-only", active && "font-medium")}>
                  {LABELS[step]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
