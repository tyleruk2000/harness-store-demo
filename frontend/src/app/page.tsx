import { Hero } from "@/components/home/Hero";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

export default async function HomePage() {
  let featured: Product[] = [];
  try {
    featured = await api.featured();
  } catch {
    // Backend not ready yet — the hero + categories still render.
    featured = [];
  }

  return (
    <>
      <Hero />
      <CategoryTiles />
      <FeaturedProducts products={featured} />
      <ValueProps />
    </>
  );
}

function ValueProps() {
  const props = [
    { title: "Free shipping over £75", body: "Build a full rack and we'll cover the postage." },
    { title: "Gear we'd climb on", body: "Every product hand-picked by people who actually send." },
    { title: "Easy 30-day returns", body: "Didn't fit the project? Send it back, no drama." },
  ];
  return (
    <section className="container-page pb-8">
      <div className="grid gap-4 rounded-3xl border border-border bg-surface p-6 sm:grid-cols-3 sm:p-8">
        {props.map((p) => (
          <div key={p.title}>
            <h3 className="font-display text-lg font-semibold text-ink-strong">{p.title}</h3>
            <p className="mt-1 text-sm text-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
