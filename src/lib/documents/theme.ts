import { contrast, isHexColor, mix } from "@/lib/color";

/** A template's paper and neutral inks. Owned by the template (decision 024). */
export interface DocumentSurface {
  paper: string;
  ink: string;
  inkMuted: string;
  rule: string;
  /** Colour for sample (placeholder) content in the live preview. */
  placeholder: string;
}

/** Brand colours resolved for one template's paper — templates never compute colours. */
export interface DocumentTheme {
  /** The chosen brand colour, or the template's default accent when none is chosen. */
  brand: string;
  /** Text colour readable on a `brand` fill (black or white). */
  onBrand: string;
  /** `brand` adjusted until it is readable as text on this paper. */
  brandText: string;
  /** A light wash of `brand` on this paper, for fills and tints. */
  brandSubtle: string;
  /** Whether the user chose a brand colour (templates may treat defaults differently). */
  brandChosen: boolean;
}

const LIGHT = "#ffffff";
const DARK = "#111111";
/** WCAG AA for normal text. */
const MIN_TEXT_CONTRAST = 4.5;

export function createDocumentTheme(
  surface: DocumentSurface,
  defaultAccent: string,
  brandColor: string | null,
): DocumentTheme {
  const brandChosen = isHexColor(brandColor);
  const brand = brandChosen ? brandColor : defaultAccent;

  const onBrand = contrast(brand, LIGHT) >= contrast(brand, DARK) ? LIGHT : DARK;

  // Step the colour toward the ink until it reads on this paper.
  let brandText = brand;
  for (let step = 1; contrast(brandText, surface.paper) < MIN_TEXT_CONTRAST && step <= 10; step++) {
    brandText = mix(brand, surface.ink, step / 10);
  }

  return {
    brand,
    onBrand,
    brandText,
    brandSubtle: mix(surface.paper, brand, 0.12),
    brandChosen,
  };
}
