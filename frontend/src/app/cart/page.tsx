"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonStyles } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, subtotal, count, hydrated, clear } = useCart();

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <Skeleton className="mb-6 h-9 w-48" />
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold text-ink-strong sm:text-4xl">Your basket</h1>
      <p className="mt-1 text-muted">
        {count > 0 ? `${count} ${count === 1 ? "item" : "items"} ready for the crag.` : "Nothing here yet."}
      </p>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<ShoppingBag className="size-6" aria-hidden />}
            title="Your rack's empty"
            description="Go find some gear worth clipping to your harness."
            action={
              <Link href="/products" className={buttonStyles({ size: "sm" })}>
                Browse gear
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-5">
            {items.map((item) => (
              <CartLineItem key={item.id} item={item} />
            ))}
          </div>

          <aside className="space-y-4 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
            <CartSummary subtotal={subtotal} />
            <Link href="/checkout" className={buttonStyles({ size: "lg", className: "w-full" })}>
              Proceed to checkout
            </Link>
            <div className="flex items-center justify-between text-sm">
              <Link href="/products" className="inline-flex items-center gap-1.5 text-primary-700 hover:underline">
                <ArrowLeft className="size-4" aria-hidden /> Continue shopping
              </Link>
              <Button variant="ghost" size="sm" onClick={clear} className="text-muted hover:text-danger">
                Clear basket
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
