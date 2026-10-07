// Exact decimal helpers built on BigInt. All rounding in the app goes through
// here so it is deterministic: half away from zero ("commercial" rounding).

const DECIMAL_PATTERN = /^([+-])?(\d*)(?:\.(\d*))?$/;

/**
 * Parses a decimal string into an integer scaled by 10^scale, rounding half
 * away from zero. "12.345" at scale 2 → 1235n. Returns null if not a number.
 * Accepts thousands separators (",") and spaces; "." is the decimal point.
 */
export function parseDecimal(input: string, scale: number): bigint | null {
  const match = DECIMAL_PATTERN.exec(input.trim().replace(/[,\s]/g, ""));
  if (!match) return null;

  const [, sign, whole = "", fraction = ""] = match;
  if (whole === "" && fraction === "") return null;

  const kept = fraction.slice(0, scale).padEnd(scale, "0");
  let scaled = BigInt((whole || "0") + kept);
  if (fraction.length > scale && fraction[scale] >= "5") scaled += 1n;

  return sign === "-" ? -scaled : scaled;
}

/**
 * Converts a JS number (e.g. a quantity or percentage) to a scaled integer
 * via its decimal representation, avoiding binary floating-point artefacts.
 */
export function toScaled(value: number, scale: number): bigint {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Expected a finite number, got ${value}`);
  }
  const text = String(value);
  const scaled = parseDecimal(/e/i.test(text) ? value.toFixed(20) : text, scale);
  if (scaled === null) throw new RangeError(`Cannot represent ${value} as a decimal`);
  return scaled;
}

/** Integer division rounding half away from zero. */
export function divideRounded(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new RangeError("Division by zero");
  if (denominator < 0n) {
    numerator = -numerator;
    denominator = -denominator;
  }
  const negative = numerator < 0n;
  const absolute = negative ? -numerator : numerator;
  const quotient = absolute / denominator;
  const rounded = (absolute % denominator) * 2n >= denominator ? quotient + 1n : quotient;
  return negative ? -rounded : rounded;
}

/** Converts back to a JS number, refusing values that would lose precision. */
export function toSafeInteger(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError(`Amount ${value} is outside the safe integer range`);
  }
  return Number(value);
}
