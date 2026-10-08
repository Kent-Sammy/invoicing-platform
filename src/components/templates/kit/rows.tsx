import type { DocumentViewAmount, DocumentViewField } from "@/lib/documents";

/**
 * Label/value pairs for a grid `<dl>`: summary rows, tax lines, bank
 * fields. Templates style the cells; the structure is shared.
 */
export function DefinitionRows({
  rows,
  labelClassName,
  valueClassName,
}: {
  rows: readonly (DocumentViewAmount | DocumentViewField)[];
  labelClassName?: string;
  valueClassName?: string;
}) {
  return rows.map((row) => (
    <div key={row.label} className="contents">
      <dt className={labelClassName}>{row.label}</dt>
      <dd className={valueClassName}>{"amount" in row ? row.amount : row.value}</dd>
    </div>
  ));
}

/**
 * A line item's description: the first line reads as the item name, any
 * further lines (Shift + Enter in the editor) as detail beneath it.
 */
export function ItemDescription({
  text,
  nameClassName,
  detailClassName,
}: {
  text: string;
  nameClassName?: string;
  detailClassName?: string;
}) {
  const [name, ...detail] = text.split("\n");
  return (
    <>
      <p className={nameClassName}>{name}</p>
      {detail.length > 0 && <p className={detailClassName}>{detail.join("\n")}</p>}
    </>
  );
}
