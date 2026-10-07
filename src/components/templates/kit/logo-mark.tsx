import { logoSize, type DocumentLogo } from "@/lib/documents";

interface LogoMarkProps {
  logo: DocumentLogo;
  /** Visual area and bounds in mm (see `logoSize`). */
  area?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

/**
 * The business logo at an aspect-aware size: square marks and wide wordmarks
 * get equal visual weight, and the image is never distorted or cropped.
 */
export function LogoMark({ logo, area, maxWidth, maxHeight, className }: LogoMarkProps) {
  const size = logoSize(logo.width, logo.height, { area, maxWidth, maxHeight });
  return (
    // eslint-disable-next-line @next/next/no-img-element -- locally stored data URL
    <img
      src={logo.src}
      alt=""
      className={className ?? "object-contain object-left"}
      style={{ width: `${size.width}mm`, height: `${size.height}mm` }}
    />
  );
}
