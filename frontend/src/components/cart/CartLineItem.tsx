"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

import { ProductImage } from "@/components/product/ProductImage";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/types/cart";

export function CartLineItem({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { setQty, remove } = useCart();

  return (
    <div className="flex gap-3 py-4">
      <Link
        href={`/products/${item.id}`}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-surface-2"
      >
        <ProductImage src={item.image_url} alt={item.name} category={item.category} sizes="80px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.id}`}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium text-ink-strong hover:text-primary-700"
          >
            {item.name}
          </Link>
          <button
            onClick={() => remove(item.id)}
            className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label={`Remove ${item.name} from basket`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QuantitySelector
            value={item.qty}
            max={item.stock}
            onChange={(next) => setQty(item.id, next)}
            size="sm"
          />
          <span className="tnum text-sm font-semibold text-ink-strong">
            {formatPrice(item.price * item.qty)}
          </span>
        </div>
      </div>
    </div>
  );
}
