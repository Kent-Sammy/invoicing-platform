/**
 * iOS and iPadOS print differently from desktop browsers. Their WebKit
 * print path ignores `@page { margin: 0 }` (AirPrint applies its own
 * margins), lays the page out wider than the paper and shrinks it to fit,
 * doesn't clone padding across page breaks, and prints `position: fixed`
 * only on page one. The desktop print frame (an exact 210 × 297 mm sheet,
 * edge to edge) can't be honoured there, so those devices get the "flow"
 * print mode in document.css instead.
 *
 * Detected by feature, not user agent: `-webkit-touch-callout` exists only
 * in iOS/iPadOS WebKit — every browser on those devices, desktop-site mode
 * included — and never on desktop Safari, Chrome or Firefox.
 *
 * Runs in <head> before the first paint; printing happens long after.
 */
export const PRINT_ENVIRONMENT_SCRIPT = `(function(){try{if(window.CSS&&CSS.supports("-webkit-touch-callout","none"))document.documentElement.setAttribute("data-print-flow","")}catch(e){}})()`;
