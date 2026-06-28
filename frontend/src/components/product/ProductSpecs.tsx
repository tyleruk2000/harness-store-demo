import { formatWeight, titleCase } from "@/lib/format";
import type { Product } from "@/types/product";

export function ProductSpecs({ product }: { product: Product }) {
  const rows: { label: string; value: string }[] = [
    { label: "Category", value: titleCase(product.category) },
    { label: "Best for", value: titleCase(product.use_case) },
  ];
  const weight = formatWeight(product.weight);
  if (weight) rows.push({ label: "Weight", value: weight });
  if (product.colour) rows.push({ label: "Colour", value: product.colour });
  if (product.rating != null) rows.push({ label: "Rating", value: `${product.rating.toFixed(1)} / 5` });
  rows.push({ label: "SKU", value: `CRX-${String(product.id).padStart(4, "0")}` });

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-5">
      <h2 className="mb-3 font-display text-base font-semibold text-ink-strong">Technical details</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 last:border-0">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="tnum text-sm font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
