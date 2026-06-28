import { OrderStatusPill } from "@/components/orders/OrderStatusPill";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-5 py-3.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="tnum font-mono text-sm font-semibold text-ink-strong">{order.order_number}</span>
          <span className="text-xs text-muted">{formatDate(order.created_at)}</span>
        </div>
        <OrderStatusPill status={order.status} />
      </div>

      <ul className="divide-y divide-border px-5">
        {order.items.map((item) => (
          <li key={item.product_id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="text-ink">
              {item.product_name} <span className="text-muted">× {item.quantity}</span>
            </span>
            <span className="tnum text-muted">{formatPrice(item.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3.5 text-sm">
        <span className="text-muted">
          Ships to {order.city}, {order.postcode}
        </span>
        <span className="font-display font-semibold text-ink-strong">
          Total <span className="tnum">{formatPrice(order.total)}</span>
        </span>
      </div>
    </article>
  );
}
