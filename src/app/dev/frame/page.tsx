import { notFound } from "next/navigation";

import { DocumentPage } from "@/components/preview/document-page";
import { createDocumentTheme, type DocumentSurface } from "@/lib/documents";

// Development-only check of the page frame itself, independent of templates:
// full-bleed paper, page-one artwork, every-page artwork, multi-page margins,
// and the document fonts (including ₦ from the latin-ext subset).

const SURFACE: DocumentSurface = {
  paper: "#d4f06b",
  ink: "#111111",
  inkMuted: "#3f4a12",
  rule: "#11111133",
  placeholder: "#6b7a2a",
};

export default function DevFramePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const theme = createDocumentTheme(SURFACE, "#111111", null);

  return (
    <div className="min-h-full bg-muted/50 p-8 print:bg-transparent print:p-0">
      <div className="mx-auto w-fit print:w-auto">
        <DocumentPage surface={SURFACE} theme={theme} font="bricolage">
          {/* Every-page artwork: a strip on the left edge of each printed page. */}
          <div className="document-every-page-art" aria-hidden>
            <div className="absolute inset-y-0 left-0 w-[7mm] bg-[repeating-linear-gradient(#7c3aed_0_22mm,#f59e0b_22mm_44mm,#10b981_44mm_66mm)]" />
          </div>
          {/* Page-one artwork bleeding off the top-right corner. */}
          <div aria-hidden className="absolute top-0 right-0 size-[48mm] rounded-bl-full bg-[#111111]" />

          <h1 className="text-[40pt] leading-none font-extrabold tracking-[-0.03em]">[FRAME CHECK]</h1>
          <div className="mt-[6mm] space-y-[1mm] text-[11pt]" data-testid="specimen">
            <p className="font-doc-sans">Bricolage Grotesque — ₦1,250,000.50 · $100.50 · £1,234.56 · €10.00</p>
            <p className="font-doc-sans font-extrabold">Bricolage Grotesque 800 — ₦1,250,000.50</p>
            <p className="font-doc-serif">Newsreader — ₦1,250,000.50 · $100.50 · £1,234.56 · €10.00</p>
            <p className="font-doc-serif italic">Newsreader italic — Thank you for your business.</p>
          </div>
          <table className="mt-[8mm] w-full border-collapse">
            <tbody className="tabular-nums">
              {Array.from({ length: 60 }, (_, i) => (
                <tr key={i} className="border-b border-doc-rule">
                  <td className="py-[2.4mm]">Line item {i + 1}</td>
                  <td className="py-[2.4mm] text-right">₦{((i + 1) * 1000).toLocaleString("en-NG")}.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DocumentPage>
      </div>
    </div>
  );
}
