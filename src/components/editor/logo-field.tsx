"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { useDocument } from "@/components/document/document-provider";
import { useAsset } from "@/components/document/use-asset";
import { LOGO_LIMITS } from "@/config/assets";
import { processLogo, type LogoError } from "@/lib/assets";
import { cn } from "@/lib/utils";

const ERRORS: Record<LogoError | "storage", string> = {
  unsupported_type: "Use a PNG, JPG, WebP or SVG image.",
  too_large: "That image is over 2 MB.",
  unreadable: "We couldn't read that image.",
  storage: "Couldn't save the logo — browser storage may be full.",
};

const TILE_HEIGHT = 30;
const TILE_MAX_WIDTH = 120;

/** Compact logo slot. Takes the logo's own shape — wide logos get a wide tile. */
export function LogoField({ onError }: { onError: (message: string | null) => void }) {
  const { document, dispatch, assets } = useDocument();
  const logo = document.branding.logo;
  const asset = useAsset(logo, assets);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const tileWidth = asset
    ? Math.min(TILE_MAX_WIDTH, Math.max(TILE_HEIGHT, (asset.width / asset.height) * TILE_HEIGHT))
    : TILE_HEIGHT;

  async function accept(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    onError(null);
    const result = await processLogo(file);
    if (!result.ok) {
      onError(ERRORS[result.error]);
      setBusy(false);
      return;
    }
    try {
      const saved = await assets.put(result.asset);
      dispatch({ type: "updateBranding", changes: { logo: { assetId: saved.id } } });
      if (logo) await assets.delete(logo.assetId);
    } catch {
      onError(ERRORS.storage);
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    dispatch({ type: "updateBranding", changes: { logo: null } });
    if (logo) assets.delete(logo.assetId).catch(() => {});
    onError(null);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  }

  return (
    <div className="group/logo relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-label={asset ? "Replace logo" : "Add logo"}
        title={asset ? "Replace logo" : "Add logo — PNG, JPG, SVG up to 2 MB"}
        style={{ width: tileWidth + 2, height: TILE_HEIGHT + 2 }}
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-md border text-muted-foreground transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          asset
            ? "border-border bg-white px-1"
            : "border-dashed border-border hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground",
          dragging && "border-foreground/40 bg-muted",
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : asset ? (
          // eslint-disable-next-line @next/next/no-img-element -- locally stored data URL
          <img src={asset.dataUrl} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <ImagePlus className="size-4" />
        )}
      </button>
      {asset && !busy && (
        <button
          type="button"
          onClick={remove}
          aria-label="Remove logo"
          className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 shadow-xs transition-opacity outline-none group-hover/logo:opacity-100 hover:text-foreground focus-visible:opacity-100"
        >
          <X className="size-2.5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={LOGO_LIMITS.acceptedTypes.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          accept(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
