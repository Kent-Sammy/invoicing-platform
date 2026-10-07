// Playful's template-owned artwork (decision 024/025): fixed palette, never
// recoloured by the user's brand colour, vector only so the PDF stays crisp.

export const PLAYFUL_PALETTE = {
  violet: "#6c4cf5",
  sun: "#ffc93c",
  mint: "#2ec4a7",
  coral: "#ff6b4a",
  sand: "#f4ead6",
} as const;

const { violet, sun, mint, coral } = PLAYFUL_PALETTE;

/**
 * Page-one corner cluster: geometric tiles that run off the top-right edges
 * of the sheet. Units are millimetres (viewBox 72×72 = 72mm square).
 */
export function CornerCluster() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 72 72"
      className="pointer-events-none absolute top-0 right-0 size-[72mm]"
    >
      {/* top row */}
      <circle cx="12" cy="12" r="3.2" fill={violet} />
      <path d="M24 0 A12 12 0 0 0 48 0 Z" fill={sun} />
      <path d="M72 0 V24 A24 24 0 0 1 48 0 Z" fill={coral} />
      {/* middle row */}
      <path d="M24 24 A24 24 0 0 1 48 48 L24 48 Z" fill={mint} />
      <circle cx="60" cy="36" r="12" fill={violet} />
      <circle cx="60" cy="36" r="4" fill={sun} />
      {/* bottom row */}
      <circle cx="60" cy="60" r="7" fill="none" stroke={mint} strokeWidth="3.5" />
      <rect x="37" y="54" width="10" height="18" rx="5" fill={coral} />
    </svg>
  );
}

/** A small sun rising from the bottom edge of the sheet, inside the margin. */
export function SunRise() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 16"
      className="pointer-events-none absolute right-[14mm] bottom-0 h-[16mm] w-[40mm]"
    >
      <path d="M4 16 A16 16 0 0 1 36 16 Z" fill={sun} />
      <circle cx="35" cy="5" r="2.6" fill={violet} />
    </svg>
  );
}

/** Tiny decorative shapes used as bullets beside section captions. */
export function Bullet({ shape }: { shape: "circle" | "square" | "half" }) {
  if (shape === "square") {
    return <span aria-hidden className="inline-block size-[2.2mm] rounded-[0.5mm] bg-[#ff6b4a]" />;
  }
  if (shape === "half") {
    return <span aria-hidden className="inline-block h-[1.4mm] w-[2.8mm] rounded-t-full bg-[#2ec4a7]" />;
  }
  return <span aria-hidden className="inline-block size-[2.4mm] rounded-full bg-[#ffc93c]" />;
}
