/** Where an explicit light/dark choice is remembered. No entry = follow the device. */
export const THEME_KEY = "nuhmera:theme";

/**
 * Runs in <head> before the first paint, so the page never flashes the
 * wrong theme. Tolerates blocked storage (falls back to the device setting).
 */
export const THEME_SCRIPT = `(function(){try{var t=null;try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

/** Applies a theme to the page (the app's dark tokens hang off `.dark`). */
export function applyTheme(dark: boolean) {
  const root = window.document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}
