import type { Metadata } from "next";

import { ProductFilters } from "@/components/filters/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { api } from "@/lib/api";
import { titleCase } from "@/lib/format";
import type { Product, UseCase } from "@/types/product";

export const metadata: Metadata = { title: "Shop all gear" };

type SearchParams = {
  category?: string;
  use_case?: string;
  search?: string;
  featured?: string;
  sort?: string;
};

function sortProducts(products: Product[], sort?: string): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    default:
      return copy; // backend already returns featured-first, then name
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const heading = searchParams.category
    ? titleCase(searchParams.category)
    : searchParams.search
      ? `Results for “${searchParams.search}”`
      : searchParams.featured
        ? "Crew picks"
        : "All gear";

  let products: Product[] | null = null;
  let failed = false;
  try {
    products = await api.listProducts({
      category: searchParams.category,
      use_case: searchParams.use_case as UseCase | undefined,
      search: searchParams.search,
      featured: searchParams.featured === "true" ? true : undefined,
    });
  } catch {
    failed = true;
  }

  const sorted = products ? sortProducts(products, searchParams.sort) : [];

  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink-strong sm:text-4xl">{heading}</h1>
        {!failed && (
          <p className="mt-1 text-muted">
            {sorted.length} {sorted.length === 1 ? "product" : "products"} ready to rack up.
          </p>
        )}
      </header>

      <div className="mb-8">
        <ProductFilters />
      </div>

      {failed ? (
        <ErrorState description="We couldn't load the catalogue. Make sure the backend is running." />
      ) : sorted.length > 0 ? (
        <ProductGrid products={sorted} />
      ) : (
        <EmptyState
          title="Nothing matches yet"
          description="Try a different category or clear your search to see the full range."
        />
      )}
    </div>
  );
}
