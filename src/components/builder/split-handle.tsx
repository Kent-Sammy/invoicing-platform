"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";

import { getBrowserStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "invoice-platform:ui:editor-split";
export const DEFAULT_SPLIT = 0.3;
/** Pixel limits; the CSS width clamp uses the same values. */
export const MIN_EDITOR_PX = 340;
export const MIN_PREVIEW_PX = 480;
const KEYBOARD_STEP = 0.02;

/** The saved editor share of the workspace width (0–1), or the default. */
export function readSplit(): number {
  try {
    const saved = Number(getBrowserStorage().getItem(STORAGE_KEY));
    return saved > 0.1 && saved < 0.9 ? saved : DEFAULT_SPLIT;
  } catch {
    return DEFAULT_SPLIT;
  }
}

function saveSplit(split: number) {
  try {
    getBrowserStorage().setItem(STORAGE_KEY, split.toFixed(4));
  } catch {
    // Storage full: the split just isn't remembered.
  }
}

/** Clamps a split so both panes keep their minimum widths in this container. */
function clampSplit(split: number, width: number) {
  if (width <= MIN_EDITOR_PX + MIN_PREVIEW_PX) return MIN_EDITOR_PX / width;
  const editor = Math.min(Math.max(split * width, MIN_EDITOR_PX), width - MIN_PREVIEW_PX);
  return editor / width;
}

interface SplitHandleProps {
  /** The flex container holding editor | handle | preview. */
  containerRef: RefObject<HTMLDivElement | null>;
  split: number;
  onSplitChange: (split: number) => void;
}

/**
 * Draggable divider between editor and preview (desktop only). Drags write
 * the CSS variable directly for smooth 60fps resizing and commit to React
 * state and storage on release. Double-click resets; arrow keys nudge.
 */
export function SplitHandle({ containerRef, split, onSplitChange }: SplitHandleProps) {
  const [dragging, setDragging] = useState(false);
  const live = useRef(split);

  function apply(next: number) {
    const container = containerRef.current;
    if (!container) return;
    live.current = clampSplit(next, container.getBoundingClientRect().width);
    container.style.setProperty("--split", String(live.current));
  }

  function commit(next: number) {
    apply(next);
    onSplitChange(live.current);
    saveSplit(live.current);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    apply((event.clientX - rect.left) / rect.width);
  }

  function endDrag() {
    if (!dragging) return;
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    commit(live.current);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta = { ArrowLeft: -KEYBOARD_STEP, ArrowRight: KEYBOARD_STEP }[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      commit(split + delta);
    } else if (event.key === "Enter") {
      commit(DEFAULT_SPLIT);
    }
  }

  return (
    <div className="relative hidden w-px shrink-0 bg-border lg:block print:hidden">
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor and preview"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split * 100)}
        tabIndex={0}
        title="Drag to resize · double-click to reset"
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => commit(DEFAULT_SPLIT)}
        onKeyDown={onKeyDown}
        className="group absolute inset-y-0 -left-[5px] z-10 w-[11px] cursor-col-resize touch-none outline-none"
      >
        {/* Hairline that strengthens on hover / drag / focus. */}
        <div
          className={cn(
            "absolute inset-y-0 left-[5px] w-px bg-transparent transition-colors duration-150",
            "group-hover:bg-foreground/15 group-focus-visible:bg-ring",
            dragging && "bg-foreground/25",
          )}
        />
        {/* Grip, centred vertically, appears on hover. */}
        <div
          className={cn(
            "absolute top-1/2 left-[3px] h-9 w-[5px] -translate-y-1/2 rounded-full border bg-background shadow-xs transition-opacity duration-150",
            "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
            dragging && "opacity-100",
          )}
        />
      </div>
    </div>
  );
}
