import type { ReactNode } from "react";

import type { DocumentViewPayment } from "@/lib/documents";

type PaymentLink = NonNullable<DocumentViewPayment["link"]>;
type PaymentQrCode = NonNullable<DocumentViewPayment["qr"]>;

/**
 * The "Pay invoice" call to action. Always the validated payment URL, opened
 * safely in a new tab; clickable in the live preview and in the saved PDF.
 * Templates style it but never change its target or wording.
 */
export function PayLink({
  link,
  className,
  children,
}: {
  link: PaymentLink;
  className?: string;
  /** Optional extra content after the label (e.g. an arrow). */
  children?: ReactNode;
}) {
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
      {children}
    </a>
  );
}

/**
 * QR code for the payment link: black modules on a white plate with a quiet
 * zone, so it scans on any paper colour. Templates choose the size via
 * `className` (keep it ≥ 20mm and include `shrink-0`) but never recolour it.
 */
export function PaymentQr({ qr, className }: { qr: PaymentQrCode; className?: string }) {
  const { size, path } = qr.code;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className ?? "size-[22mm] shrink-0"}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${qr.caption}: ${qr.display}`}
    >
      <rect width={size} height={size} fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  );
}
