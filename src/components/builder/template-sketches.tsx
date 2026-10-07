import type { PlannedTemplateId } from "@/components/templates/registry";

// Lightweight direction sketches for templates still in development, drawn
// from the approved directions (docs/TEMPLATE_DIRECTIONS.md). Each is
// replaced by a live render of the real template once it is built.
// Units are millimetres on an A4 sheet (viewBox 210×297).

const DISPLAY = "var(--font-bricolage), sans-serif";
const SERIF = "var(--font-newsreader), serif";

function Lines({ x, y, widths, gap = 7, fill, height = 2.6 }: {
  x: number; y: number; widths: number[]; gap?: number; fill: string; height?: number;
}) {
  return (
    <>
      {widths.map((width, i) => (
        <rect key={i} x={x} y={y + i * gap} width={width} height={height} rx={height / 2} fill={fill} />
      ))}
    </>
  );
}

function Editorial() {
  return (
    <svg viewBox="0 0 210 297" className="size-full">
      <rect width="210" height="297" fill="#d4f06b" />
      <text x="16" y="44" fontFamily={DISPLAY} fontWeight="800" fontSize="33" letterSpacing="-1.6" fill="#111111">[STUDIO]</text>
      <text x="16" y="70" fontFamily={DISPLAY} fontWeight="700" fontSize="6.5" fill="#111111">[7 Oct 2026]</text>
      <text x="62" y="70" fontFamily={DISPLAY} fontWeight="700" fontSize="6.5" fill="#111111">[#INV-0001]</text>
      <text x="194" y="72" textAnchor="end" fontFamily={DISPLAY} fontWeight="800" fontSize="17" letterSpacing="-0.6" fill="#111111">INVOICE</text>
      <rect x="16" y="78" width="178" height="0.7" fill="#111111" />
      {[0, 1].map((row) => (
        <g key={row}>
          <text x="16" y={90 + row * 20} fontFamily={DISPLAY} fontWeight="700" fontSize="5.5" fill="#111111">Project item</text>
          <text x="24" y={97 + row * 20} fontFamily={SERIF} fontSize="5" fill="#2f3a0c">Detail line</text>
          <text x="194" y={90 + row * 20} textAnchor="end" fontFamily={DISPLAY} fontWeight="700" fontSize="5.5" fill="#111111">3,500.00</text>
        </g>
      ))}
      <Lines x={120} y={176} widths={[74, 74]} gap={6} fill="#111111" height={2} />
      <text x="120" y="198" fontFamily={DISPLAY} fontWeight="800" fontSize="7" fill="#111111">BALANCE DUE</text>
      <rect x="16" y="226" width="178" height="0.7" fill="#111111" />
      <text x="16" y="246" fontFamily={DISPLAY} fontWeight="800" fontSize="19" letterSpacing="-0.8" fill="#111111">PAYMENT</text>
      <Lines x={16} y={254} widths={[34, 44, 40]} gap={5} fill="#111111" height={1.8} />
      <rect x="104" y="234" width="20" height="20" fill="#111111" />
      <rect x="107" y="237" width="14" height="14" fill="#d4f06b" />
      <Lines x={134} y={236} widths={[60, 56, 60, 48, 58]} gap={4} fill="#3b4a0f" height={1.4} />
      <rect x="16" y="276" width="178" height="0.7" fill="#111111" />
      {[0, 1, 2, 3].map((col) => (
        <rect key={col} x={16 + col * 46} y="281" width="34" height="1.8" rx="0.9" fill="#111111" />
      ))}
    </svg>
  );
}

function Elegant() {
  return (
    <svg viewBox="0 0 210 297" className="size-full">
      <defs>
        <radialGradient id="elegant-glow-a" cx="0.3" cy="0.9" r="0.7">
          <stop offset="0" stopColor="#3b6ff5" stopOpacity="0.95" />
          <stop offset="1" stopColor="#3b6ff5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="elegant-glow-b" cx="0.72" cy="0.75" r="0.55">
          <stop offset="0" stopColor="#ff7a45" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#c2410c" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c2410c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="210" height="297" fill="#0d0d10" />
      <rect width="210" height="62" fill="url(#elegant-glow-a)" />
      <rect width="210" height="62" fill="url(#elegant-glow-b)" />
      <path d="M0 62 C 60 40, 120 20, 210 46 L210 62 Z" fill="#0d0d10" />
      <text x="18" y="96" fontFamily={SERIF} fontWeight="300" fontSize="26" letterSpacing="0.5" fill="#f4f4f5">Invoice</text>
      <Lines x={18} y={102} widths={[34]} fill="#71717a" height={2} />
      {[18, 80, 150].map((x) => (
        <Lines key={x} x={x} y={118} widths={[22, 34, 28, 30]} gap={5.5} fill="#3f3f46" height={1.8} />
      ))}
      <line x1="18" y1="148" x2="192" y2="148" stroke="#27272a" strokeWidth="0.4" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <Lines x={18} y={156 + row * 10} widths={[44]} fill="#52525b" height={2} />
          <rect x="166" y={156 + row * 10} width="26" height="2" rx="1" fill="#a1a1aa" />
          <line x1="18" y1={162 + row * 10} x2="192" y2={162 + row * 10} stroke="#27272a" strokeWidth="0.4" />
        </g>
      ))}
      <Lines x={140} y={196} widths={[52, 52]} gap={6} fill="#52525b" height={2} />
      <rect x="140" y="210" width="52" height="0.4" fill="#52525b" />
      <rect x="166" y="215" width="26" height="3" rx="1.5" fill="#f4f4f5" />
      <Lines x={18} y={240} widths={[28, 52, 46, 40]} gap={5} fill="#3f3f46" height={1.6} />
      <rect x="150" y="238" width="42" height="9" rx="4.5" fill="#f4f4f5" />
    </svg>
  );
}

export const TEMPLATE_SKETCHES: Record<PlannedTemplateId, () => React.JSX.Element> = {
  editorial: Editorial,
  elegant: Elegant,
};
