"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { ProductImage } from "@/components/product/ProductImage";
import { StockBadge } from "@/components/product/StockBadge";
import { cn } from "@/lib/cn";
import { api, ApiError } from "@/lib/api";
import { formatPrice, titleCase } from "@/lib/format";
import type { Product } from "@/types/product";

export function AdminProductTable({
  products,
  passcode,
  onUpdated,
}: {
  products: Product[];
  passcode: string;
  onUpdated: (product: Product) => void;
}) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleFeatured(product: Product) {
    setBusyId(product.id);
    setError(null);
    try {
      const updated = await api.updateProduct(product.id, { featured: !product.featured }, passcode);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink-strong">Catalogue</h2>
        <span className="text-sm text-muted">{products.length} products</span>
      </div>

      {error && (
        <p className="border-b border-border bg-danger/10 px-5 py-2 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}

      <ul className="divide-y divide-border">
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-4 px-5 py-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              <ProductImage src={product.image_url} alt={product.name} category={product.category} sizes="48px" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-strong">{product.name}</p>
              <p className="text-xs text-muted">{titleCase(product.category)} · {formatPrice(product.price)}</p>
            </div>
            <div className="hidden sm:block">
              <StockBadge stock={product.stock_quantity} />
            </div>
            <span className="tnum hidden w-16 text-right text-sm text-muted md:block">
              {product.stock_quantity} left
            </span>
            <button
              onClick={() => toggleFeatured(product)}
              disabled={busyId === product.id}
              aria-pressed={product.featured}
              aria-label={product.featured ? `Unfeature ${product.name}` : `Feature ${product.name}`}
              className={cn(
                "grid size-9 place-items-center rounded-lg border transition-colors disabled:opacity-50",
                product.featured
                  ? "border-accent-500/40 bg-accent-500/15 text-accent-600"
                  : "border-border-strong text-muted hover:bg-primary-50",
              )}
            >
              <Star className="size-4" fill={product.featured ? "currentColor" : "none"} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
