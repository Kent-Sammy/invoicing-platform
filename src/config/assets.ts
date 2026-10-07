/** Limits for user-uploaded logos. */
export const LOGO_LIMITS = {
  /** Largest file accepted before processing (~2 MB). */
  maxUploadBytes: 2 * 1024 * 1024,
  /** Processing aims to keep the stored image at or below this (~500 KB). */
  targetBytes: 500 * 1024,
  /** Longest side after resizing — ample for a logo printed at A4 size. */
  maxDimension: 1200,
  /** Never shrink below this while trying to hit the target size. */
  minDimension: 256,
  acceptedTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
} as const;
