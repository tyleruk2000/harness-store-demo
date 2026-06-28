"use client";

import { Backpack, Check } from "lucide-react";
import { useState } from "react";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types/product";

export function AddToCartButton({
  product,
  qty = 1,
  variant = "primary",
  size = "md",
  fullWidth,
  label = "Add to rack",
}: {
  product: Product;
  qty?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  label?: string;
}) {
  const { add } = useCart();
  const { notify } = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = product.stock_quantity <= 0;

  function handleAdd() {
    add(product, qty);
    notify(`Added ${product.name}${qty > 1 ? ` ×${qty}` : ""} to your rack`, {
      action: { label: "View basket", href: "/cart" },
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAdd}
      disabled={soldOut}
      className={fullWidth ? "w-full" : undefined}
    >
      {justAdded ? (
        <>
          <Check className="size-4" aria-hidden /> Added
        </>
      ) : (
        <>
          <Backpack className="size-4" aria-hidden /> {soldOut ? "Sold out" : label}
        </>
      )}
    </Button>
  );
}
