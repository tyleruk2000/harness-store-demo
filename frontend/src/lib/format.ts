const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Format a number as GBP, e.g. 89 -> "£89.00". */
export function formatPrice(value: number): string {
  return gbp.format(value);
}

/** Weight in grams -> "320 g" or "4.10 kg" once it crosses 1kg. */
export function formatWeight(grams: number | null): string | null {
  if (grams == null) return null;
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
