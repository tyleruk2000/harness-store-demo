"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";

import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/states";
import { useCart } from "@/lib/cart-context";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { items, subtotal, count } = useCart();
  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cart-overlay fixed inset-0 z-backdrop bg-primary-950/40 backdrop-blur-sm" />
        <Dialog.Content
          className="cart-panel fixed inset-y-0 right-0 z-modal flex w-full max-w-md flex-col bg-surface shadow-card-hover focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="flex items-center gap-2 font-display text-lg font-semibold text-ink-strong">
              <ShoppingBag className="size-5 text-primary-600" aria-hidden />
              Your rack
              {count > 0 && <span className="tnum text-sm font-normal text-muted">({count})</span>}
            </Dialog.Title>
            <Dialog.Close
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-primary-50 hover:text-ink"
              aria-label="Close basket"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={<ShoppingBag className="size-6" aria-hidden />}
                title="Your rack's empty"
                description="Go find some gear worth clipping to your harness."
                action={
                  <Link href="/products" onClick={close} className={buttonStyles({ size: "sm" })}>
                    Browse gear
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <div className="flex-1 divide-y divide-border overflow-y-auto px-5">
                {items.map((item) => (
                  <CartLineItem key={item.id} item={item} onNavigate={close} />
                ))}
              </div>
              <div className="space-y-4 border-t border-border bg-surface-2 px-5 py-4">
                <CartSummary subtotal={subtotal} compact />
                <div className="grid gap-2">
                  <Link href="/checkout" onClick={close} className={buttonStyles({ className: "w-full" })}>
                    Checkout
                  </Link>
                  <Link
                    href="/products"
                    onClick={close}
                    className={buttonStyles({ variant: "ghost", size: "sm", className: "w-full" })}
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
