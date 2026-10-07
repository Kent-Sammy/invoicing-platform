interface LogoSizeOptions {
  /** Visual area every logo is scaled to, in mm² — keeps square and wide logos balanced. */
  area?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Display size (mm) for a logo of any aspect ratio. Scaling to a constant
 * area — rather than a fixed height or width — makes a square mark and a
 * wide wordmark read at the same visual weight, then clamps to the box.
 */
export function logoSize(
  width: number,
  height: number,
  { area = 260, maxWidth = 60, maxHeight = 20 }: LogoSizeOptions = {},
): { width: number; height: number } {
  if (!(width > 0 && height > 0)) return { width: maxHeight, height: maxHeight };
  const ratio = width / height;
  let w = Math.sqrt(area * ratio);
  let h = w / ratio;
  if (w > maxWidth) {
    w = maxWidth;
    h = w / ratio;
  }
  if (h > maxHeight) {
    h = maxHeight;
    w = h * ratio;
  }
  return { width: Math.round(w * 10) / 10, height: Math.round(h * 10) / 10 };
}
