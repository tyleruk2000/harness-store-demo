import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductImage } from "@/components/product/ProductImage";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { RatingStars } from "@/components/product/RatingStars";
import { StockBadge } from "@/components/product/StockBadge";
import { AddToCartBar } from "@/components/product/AddToCartBar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Badge } from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api";
import { formatPrice, titleCase } from "@/lib/format";
import type { Product } from "@/types/product";

async function loadProduct(id: number): Promise<Product> {
  try {
    return await api.getProduct(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return { title: "Product" };
  try {
    const product = await api.getProduct(id);
    return { title: product.name, description: product.short_description };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const product = await loadProduct(id);
  let related: Product[] = [];
  try {
    related = await api.getRelated(id);
  } catch {
    related = [];
  }

  return (
    <div className="container-page py-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/products" className="hover:text-primary-700">Shop</Link>
        <ChevronRight className="size-4" aria-hidden />
        <Link href={`/products?category=${product.category}`} className="hover:text-primary-700">
          {titleCase(product.category)}
        </Link>
        <ChevronRight className="size-4" aria-hidden />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface-2">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            category={product.category}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {product.featured && <Badge tone="accent" className="absolute left-4 top-4">Crew pick</Badge>}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="font-medium uppercase tracking-wide">{titleCase(product.category)}</span>
            <span aria-hidden>·</span>
            <span>Best for {titleCase(product.use_case)}</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold text-ink-strong sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <RatingStars rating={product.rating} />
            <StockBadge stock={product.stock_quantity} />
          </div>

          <p className="mt-5 text-lg text-ink">{product.short_description}</p>

          <p className="tnum mt-5 font-display text-4xl font-semibold text-ink-strong">
            {formatPrice(product.price)}
          </p>

          <div className="mt-6">
            <AddToCartBar product={product} />
          </div>

          {product.long_description && (
            <div className="mt-8">
              <h2 className="mb-2 font-display text-base font-semibold text-ink-strong">The details</h2>
              <p className="leading-relaxed text-muted">{product.long_description}</p>
            </div>
          )}

          <div className="mt-6">
            <ProductSpecs product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold text-ink-strong">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
