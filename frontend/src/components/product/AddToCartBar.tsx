"use client";

import { useState } from "react";
import { Backpack, Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types/product";

export function AddToCartBar({ product }: { product: Product }) {
  const { add } = useCart();
  const { notify } = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock_quantity <= 0;

  function handleAdd() {
    add(product, qty);
    notify(`Added ${product.name}${qty > 1 ? ` ×${qty}` : ""} to your rack`, {
      action: { label: "View basket", href: "/cart" },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!soldOut && (
        <QuantitySelector value={qty} max={product.stock_quantity} onChange={setQty} />
      )}
      <Button size="lg" onClick={handleAdd} disabled={soldOut} className="flex-1 sm:flex-none">
        {added ? (
          <>
            <Check className="size-4" aria-hidden /> Added to rack
          </>
        ) : (
          <>
            <Backpack className="size-4" aria-hidden /> {soldOut ? "Sold out" : "Add to rack"}
          </>
        )}
      </Button>
    </div>
  );
}
