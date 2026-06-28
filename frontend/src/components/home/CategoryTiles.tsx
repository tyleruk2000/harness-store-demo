import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CATEGORIES } from "@/lib/constants";

/** Category entry points. Each tile is a distinct, full-bleed gradient world. */
const TILE_STYLES: Record<string, string> = {
  harnesses: "from-primary-600 to-primary-800",
  helmets: "from-accent-600 to-accent-700",
  ropes: "from-primary-500 to-primary-700",
  carabiners: "from-primary-700 to-primary-950",
};

export function CategoryTiles() {
  return (
    <section className="container-page py-16">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink-strong">Shop by discipline</h2>
          <p className="mt-1 text-muted">Four categories, everything you need to get off the ground.</p>
        </div>
        <Link href="/products" className="hidden text-sm font-medium text-primary-700 hover:underline sm:inline">
          View everything
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={`group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-card transition-transform duration-200 ease-out-quart hover:-translate-y-1 ${TILE_STYLES[c.slug]}`}
          >
            <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="size-5" aria-hidden />
            </span>
            <h3 className="font-display text-2xl font-semibold text-white">{c.label}</h3>
            <p className="text-sm text-white/80">{c.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
