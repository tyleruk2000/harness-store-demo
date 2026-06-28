"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, PartyPopper } from "lucide-react";

import { buttonStyles } from "@/components/ui/Button";
import { OrderStatusPill } from "@/components/orders/OrderStatusPill";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { STORAGE_KEYS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.lastOrder);
      if (raw) setOrder(JSON.parse(raw) as Order);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="container-page py-16">
        <Skeleton className="mx-auto h-64 w-full max-w-lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PartyPopper className="size-6" aria-hidden />}
          title="No recent order to show"
          description="Your confirmation appears here right after you place an order."
          action={
            <Link href="/products" className={buttonStyles({ size: "sm" })}>
              Start shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-full bg-success/12 text-success">
            <CheckCircle2 className="size-9" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-ink-strong sm:text-4xl">
            You&apos;re all racked up!
          </h1>
          <p className="mt-2 text-muted">
            Thanks {order.customer_name ?? "climber"} — your demo order is confirmed and ready to (pretend to) ship.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Order number</p>
              <p className="tnum font-mono text-lg font-semibold text-ink-strong">{order.order_number}</p>
            </div>
            <OrderStatusPill status={order.status} />
          </div>

          <ul className="divide-y divide-border px-5">
            {order.items.map((item) => (
              <li key={item.product_id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="text-ink">
                  {item.product_name} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="tnum font-medium text-ink">{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-1.5 border-t border-border px-5 py-4 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            <Row label="Shipping" value={order.shipping === 0 ? "Free" : formatPrice(order.shipping)} />
            <div className="flex items-center justify-between pt-2 font-display text-base font-semibold text-ink-strong">
              <dt>Total paid</dt>
              <dd className="tnum">{formatPrice(order.total)}</dd>
            </div>
          </dl>

          <div className="border-t border-border px-5 py-4 text-sm text-muted">
            <p className="font-medium text-ink-strong">Shipping to</p>
            <p>{order.address}, {order.city}, {order.postcode}, {order.country}</p>
            <p className="mt-1">A confirmation was “sent” to {order.customer_email}.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/products" className={buttonStyles({})}>Keep shopping</Link>
          <Link href={`/orders?email=${encodeURIComponent(order.customer_email)}`} className={buttonStyles({ variant: "secondary" })}>
            View order history
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="tnum text-ink">{value}</dd>
    </div>
  );
}
