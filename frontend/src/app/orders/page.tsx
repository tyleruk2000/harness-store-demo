"use client";

import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";

import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { api, ApiError } from "@/lib/api";
import type { Order } from "@/types/order";

function OrdersInner() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const search = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setStatus("loading");
    try {
      const result = await api.ordersByEmail(trimmed);
      setOrders(result);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setOrders(null);
      if (!(err instanceof ApiError)) console.error(err);
    }
  }, []);

  // Auto-search when arriving from the success page with ?email=.
  useEffect(() => {
    const initial = params.get("email");
    if (initial) {
      setEmail(initial);
      void search(initial);
    }
  }, [params, search]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void search(email);
  }

  return (
    <div className="container-page py-10">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-ink-strong sm:text-4xl">Order history</h1>
        <p className="mt-1 text-muted">
          Enter the email you checked out with to see your previous demo orders.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-6 flex max-w-md gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="pl-9"
          />
        </div>
        <Button type="submit" loading={status === "loading"}>
          Find orders
        </Button>
      </form>

      <div className="mt-8">
        {status === "loading" && (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        )}
        {status === "error" && (
          <ErrorState description="We couldn't load orders. Make sure the backend is running and try again." />
        )}
        {status === "done" && orders && orders.length === 0 && (
          <EmptyState
            icon={<PackageSearch className="size-6" aria-hidden />}
            title="No orders found"
            description="We couldn't find any orders for that email. Double-check the address you used at checkout."
          />
        )}
        {status === "done" && orders && orders.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {orders.length} {orders.length === 1 ? "order" : "orders"} found.
            </p>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="container-page py-10"><Skeleton className="h-9 w-48" /></div>}>
      <OrdersInner />
    </Suspense>
  );
}
