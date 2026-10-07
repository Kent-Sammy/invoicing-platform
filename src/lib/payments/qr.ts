import { encode } from "uqr";

export interface QrCode {
  /** Modules per side, including the quiet zone. */
  size: number;
  /** SVG path drawing every dark module, in module units (viewBox 0 0 size size). */
  path: string;
}

/** Quiet zone in modules. 2 is enough on white paper with whitespace around it. */
const QUIET_ZONE = 2;

/**
 * Encodes text as a QR code drawn as a single SVG path, so it stays crisp
 * at any print size. Medium error correction survives print and scanning wear.
 */
export function createQrCode(text: string): QrCode {
  const { data, size } = encode(text, { ecc: "M", border: QUIET_ZONE });
  let path = "";
  data.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    });
  });
  return { size, path };
}
