import { LOGO_LIMITS } from "@/config/assets";

import type { NewAsset } from "./asset-store";

export type LogoError = "unsupported_type" | "too_large" | "unreadable";

export type LogoResult = { ok: true; asset: NewAsset } | { ok: false; error: LogoError };

const SVG_TYPE = "image/svg+xml";
const QUALITY_STEPS = [0.9, 0.8, 0.7];
const DOWNSCALE_STEP = 0.75;

/** Checks type and size before any processing. Pure, so it runs anywhere. */
export function validateLogoFile(file: { type: string; size: number }): LogoError | null {
  if (!(LOGO_LIMITS.acceptedTypes as readonly string[]).includes(file.type)) {
    return "unsupported_type";
  }
  if (file.size > LOGO_LIMITS.maxUploadBytes) return "too_large";
  return null;
}

/** Scales width × height so the longest side is at most `max` (or exactly `max` if `fit`). */
export function fitWithin(
  width: number,
  height: number,
  max: number,
  fit = false,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  const scale = fit || longest > max ? max / longest : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

/** Intrinsic size of an SVG that declares none, from its viewBox. */
async function svgSize(file: File): Promise<{ width: number; height: number }> {
  const svg = new DOMParser().parseFromString(await file.text(), SVG_TYPE).documentElement;
  const [, , width, height] = (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  return width > 0 && height > 0 ? { width, height } : { width: 512, height: 512 };
}

function encode(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Re-encodes an uploaded logo for storage (browser only):
 * - every format, SVG included, is redrawn onto a canvas — so SVGs are
 *   sanitised by rasterisation: scripts, links and external references
 *   cannot survive into the stored image;
 * - resized so the longest side is at most 1200px (SVGs render at 1200px);
 * - encoded as WebP (keeps transparency), falling back to PNG in browsers
 *   that cannot encode WebP;
 * - quality, then size, stepped down until it fits ~500 KB where practical.
 */
export async function processLogo(file: File): Promise<LogoResult> {
  const invalid = validateLogoFile(file);
  if (invalid) return { ok: false, error: invalid };

  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const isSvg = file.type === SVG_TYPE;
    const natural =
      image.naturalWidth > 0 && image.naturalHeight > 0
        ? { width: image.naturalWidth, height: image.naturalHeight }
        : await svgSize(file);
    let size = fitWithin(natural.width, natural.height, LOGO_LIMITS.maxDimension, isSvg);

    const canvas = document.createElement("canvas");
    for (;;) {
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext("2d");
      if (!context) return { ok: false, error: "unreadable" };
      context.drawImage(image, 0, 0, size.width, size.height);

      let blob: Blob | null = null;
      for (const quality of QUALITY_STEPS) {
        blob = await encode(canvas, "image/webp", quality);
        if (blob?.type !== "image/webp") blob = await encode(canvas, "image/png");
        if (!blob || blob.size <= LOGO_LIMITS.targetBytes || blob.type !== "image/webp") break;
      }
      if (!blob) return { ok: false, error: "unreadable" };

      const longest = Math.max(size.width, size.height);
      if (blob.size <= LOGO_LIMITS.targetBytes || longest <= LOGO_LIMITS.minDimension) {
        return {
          ok: true,
          asset: {
            mimeType: blob.type,
            width: size.width,
            height: size.height,
            byteSize: blob.size,
            dataUrl: await toDataUrl(blob),
          },
        };
      }
      size = fitWithin(size.width, size.height, Math.max(LOGO_LIMITS.minDimension, Math.round(longest * DOWNSCALE_STEP)));
    }
  } catch {
    // Undecodable image, or a canvas the browser refuses to export.
    return { ok: false, error: "unreadable" };
  } finally {
    URL.revokeObjectURL(url);
  }
}
