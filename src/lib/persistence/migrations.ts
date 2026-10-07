/** Current shape of stored drafts. Bump when BusinessDocument changes incompatibly. */
export const SCHEMA_VERSION = 3;

type Draft = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** v2 → v3: `paymentDetails` became `paymentOptions.bankTransfer`. */
function v2ToV3(document: Draft): Draft {
  const { paymentDetails, ...rest } = document;
  const details = isRecord(paymentDetails) ? paymentDetails : {};
  const text = (key: string) => (typeof details[key] === "string" ? (details[key] as string) : "");
  const bankTransfer = {
    bankName: text("bankName"),
    accountName: text("accountName"),
    accountNumber: text("accountNumber"),
    instructions: text("instructions"),
  };
  return {
    ...rest,
    paymentOptions: {
      bankTransfer: {
        enabled: Object.values(bankTransfer).some((value) => value.trim() !== ""),
        ...bankTransfer,
      },
      paymentLink: { enabled: false, url: "", showButton: true },
      qrCode: { enabled: false },
    },
  };
}

const MIGRATIONS: Record<number, (document: Draft) => Draft> = { 2: v2ToV3 };

/**
 * Upgrades a stored document to the current schema, one version at a time.
 * Returns null for versions we can't migrate (the draft is then discarded).
 */
export function migrateDocument(version: number, document: unknown): unknown {
  let current = document;
  for (let v = version; v < SCHEMA_VERSION; v++) {
    const migrate = MIGRATIONS[v];
    if (!migrate || !isRecord(current)) return null;
    current = migrate(current);
  }
  return version > SCHEMA_VERSION ? null : current;
}
