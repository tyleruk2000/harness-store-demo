import { Truck } from "lucide-react";

import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export function computeTotals(subtotal: number) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  return { subtotal, shipping, total: subtotal + shipping };
}

export function CartSummary({ subtotal, compact = false }: { subtotal: number; compact?: boolean }) {
  const { shipping, total } = computeTotals(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="space-y-3">
      {remaining > 0 && subtotal > 0 && (
        <div className="rounded-xl bg-primary-50 p-3 text-sm text-primary-800">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Truck className="size-4" aria-hidden /> {formatPrice(remaining)} away from free shipping
          </span>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-100">
            <div
              className="h-full rounded-full bg-accent-500 transition-[width] duration-500 ease-out-expo"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tnum font-medium text-ink">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="tnum font-medium text-ink">
            {shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}
          </dd>
        </div>
        {!compact && <div className="border-t border-border" />}
        <div className="flex items-center justify-between pt-1">
          <dt className="font-display text-base font-semibold text-ink-strong">Total</dt>
          <dd className="tnum font-display text-lg font-semibold text-ink-strong">{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
