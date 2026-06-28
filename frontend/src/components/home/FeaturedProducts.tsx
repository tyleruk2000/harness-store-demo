import Link from "next/link";

import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/states";
import { buttonStyles } from "@/components/ui/Button";
import type { Product } from "@/types/product";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="container-page py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink-strong">Crew picks</h2>
          <p className="mt-1 text-muted">The gear our imaginary guides reach for first.</p>
        </div>
        <Link
          href="/products?featured=true"
          className={buttonStyles({ variant: "secondary", size: "sm", className: "hidden sm:inline-flex" })}
        >
          See all favourites
        </Link>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState title="No featured gear yet" description="Check back once the shelves are stocked." />
      )}
    </section>
  );
}
