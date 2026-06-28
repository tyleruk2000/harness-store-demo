import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "@/components/product/ProductImage";
import { RatingStars } from "@/components/product/RatingStars";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatPrice, titleCase } from "@/lib/format";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock_quantity <= 0;
  const low = !soldOut && product.stock_quantity <= 6;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-1 hover:shadow-card-hover focus-within:-translate-y-1">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-2">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={product.category}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="transition-transform duration-300 ease-out-quart group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.featured && <Badge tone="accent">Crew pick</Badge>}
          {soldOut && <Badge tone="danger">Sold out</Badge>}
          {low && <Badge tone="warning">Only {product.stock_quantity} left</Badge>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span className="font-medium uppercase tracking-wide">{titleCase(product.category)}</span>
          <span>{titleCase(product.use_case)}</span>
        </div>

        <h3 className="font-display text-lg leading-tight text-ink-strong">
          <Link href={`/products/${product.id}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-muted">{product.short_description}</p>

        <div className="mt-1 flex items-center justify-between">
          <RatingStars rating={product.rating} />
          <span className="tnum font-display text-xl font-semibold text-ink-strong">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Relative wrapper lifts the button above the card-cover link. */}
        <div className="relative z-10 mt-2">
          <AddToCartButton product={product} size="sm" fullWidth />
        </div>
      </div>
    </article>
  );
}
