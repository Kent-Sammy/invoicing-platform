"use client";

import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";

import { useDocument } from "@/components/document/document-provider";
import { getTemplate } from "@/components/templates/registry";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BRAND_COLOR_PRESETS, normalizeHexColor } from "@/config/brand-colors";
import { cn } from "@/lib/utils";

function Swatch({
  color,
  label,
  selected,
  onSelect,
  children,
}: {
  color: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      style={{ backgroundColor: color }}
      className={cn(
        "relative flex size-8 items-center justify-center rounded-full ring-1 ring-foreground/10 ring-inset outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50",
        selected && "ring-2 ring-foreground ring-offset-2 ring-offset-popover",
      )}
    >
      {children}
      {selected && <Check className="size-3.5 text-white mix-blend-difference" />}
    </button>
  );
}

/** A readable name for the current brand colour. */
export function brandColorName(color: string | null): string {
  if (color === null) return "Template default";
  return BRAND_COLOR_PRESETS.find((preset) => preset.value === color)?.name ?? color.toUpperCase();
}

/**
 * The brand colour picker, opened from its trigger (the Appearance row's
 * "Change"). The template decides where the colour goes; "Template default"
 * (null) keeps each template's own designed accent.
 */
export function BrandColorPicker({ children }: { children: ReactNode }) {
  const { document, dispatch } = useDocument();
  const { brandColor, templateId } = document.branding;
  const template = getTemplate(templateId);
  const [hex, setHex] = useState<string | null>(null);

  const setColor = (next: string | null) => {
    dispatch({ type: "updateBranding", changes: { brandColor: next } });
    setHex(null);
  };
  const isPreset = BRAND_COLOR_PRESETS.some((preset) => preset.value === brandColor);
  const custom = brandColor !== null && !isPreset;
  const hexInvalid = hex !== null && hex.trim() !== "" && normalizeHexColor(hex) === null;

  return (
    <Popover onOpenChange={() => setHex(null)}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent>
        <p className="text-[13px] font-medium">Brand colour</p>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {template.name} uses it for accents. Your invoice stays readable with any colour.
        </p>
        <div role="radiogroup" aria-label="Brand colour" className="mt-3 grid grid-cols-5 gap-2">
          <Swatch
            color={template.defaultAccent}
            label={`Template default (${template.name})`}
            selected={brandColor === null}
            onSelect={() => setColor(null)}
          >
            {brandColor !== null && (
              <span className="text-[9px] font-semibold tracking-wide text-white mix-blend-difference">
                AUTO
              </span>
            )}
          </Swatch>
          {BRAND_COLOR_PRESETS.map((preset) => (
            <Swatch
              key={preset.value}
              color={preset.value}
              label={preset.name}
              selected={brandColor === preset.value}
              onSelect={() => setColor(preset.value)}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <label
            className={cn(
              "relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-foreground/10 ring-inset focus-within:ring-3 focus-within:ring-ring/50",
              custom && "ring-2 ring-foreground ring-offset-2 ring-offset-popover",
            )}
            style={{
              background: custom
                ? (brandColor ?? undefined)
                : "conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)",
            }}
            title="Pick any colour"
          >
            <input
              type="color"
              aria-label="Pick a custom colour"
              value={brandColor ?? template.defaultAccent}
              onChange={(event) => setColor(event.target.value.toLowerCase())}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
          <Input
            aria-label="Hex colour"
            aria-invalid={hexInvalid || undefined}
            value={hex ?? brandColor ?? ""}
            placeholder="#4f46e5"
            onChange={(event) => {
              setHex(event.target.value);
              const next = normalizeHexColor(event.target.value);
              if (next) dispatch({ type: "updateBranding", changes: { brandColor: next } });
            }}
            onBlur={() => setHex(null)}
            spellCheck={false}
            autoComplete="off"
            className="h-8 font-mono text-[12.5px] uppercase placeholder:normal-case"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
