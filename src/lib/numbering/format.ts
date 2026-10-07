const DEFAULT_PADDING = 4;

/** formatDocumentNumber("INV-", 1) → "INV-0001". Numbers beyond the padding grow naturally. */
export function formatDocumentNumber(
  prefix: string,
  sequence: number,
  padding: number = DEFAULT_PADDING,
): string {
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new RangeError(`Sequence must be a positive integer, got ${sequence}`);
  }
  return `${prefix}${String(sequence).padStart(padding, "0")}`;
}
