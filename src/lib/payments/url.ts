/** Longer links are refused: real payment links are far shorter, and a QR code must still scan. */
export const MAX_PAYMENT_URL_LENGTH = 500;

/**
 * Turns user input into a safe, absolute payment URL, or null if it isn't
 * one. Only http(s) links are allowed — never javascript:, data:, etc. —
 * because the URL becomes a clickable link and a QR code on the invoice.
 * "paystack.com/pay/x" is accepted and becomes "https://paystack.com/pay/x".
 */
export function normalizePaymentUrl(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "" || /\s/.test(trimmed) || trimmed.length > MAX_PAYMENT_URL_LENGTH) return null;

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  // Require a real-looking host ("paystack.com", not "paystack").
  if (!url.hostname.includes(".") || url.hostname.endsWith(".")) return null;
  return url.href;
}

/** Short, readable form for print: "paystack.com/pay/example". */
export function displayPaymentUrl(url: string, maxLength = 48): string {
  const { hostname, pathname, search } = new URL(url);
  const text = `${hostname.replace(/^www\./, "")}${pathname === "/" ? "" : pathname}${search}`;
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
