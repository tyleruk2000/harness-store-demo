import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { CATEGORIES } from "@/lib/constants";
import { DemoBadge } from "@/components/home/DemoBadge";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            Harnesses, ropes, helmets and hardware for imaginary adventures. Gear up for your next
            send.
          </p>
          <DemoBadge />
        </div>

        <nav aria-label="Shop">
          <h2 className="mb-3 text-sm font-semibold text-ink-strong">Shop</h2>
          <ul className="space-y-2 text-sm text-muted">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-primary-700">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="mb-3 text-sm font-semibold text-ink-strong">Your stuff</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/cart" className="hover:text-primary-700">Basket</Link></li>
            <li><Link href="/orders" className="hover:text-primary-700">Order history</Link></li>
            <li><Link href="/admin" className="hover:text-primary-700">Admin</Link></li>
          </ul>
        </nav>

        <nav aria-label="Developer">
          <h2 className="mb-3 text-sm font-semibold text-ink-strong">Under the hood</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="/api/docs" className="hover:text-primary-700">API docs (Swagger)</a></li>
            <li><a href="/api/health" className="hover:text-primary-700">Health check</a></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Crux — a demo store. No real gear, no real money.</p>
          <p>Demo checkout. Real Kubernetes energy.</p>
        </div>
      </div>
    </footer>
  );
}
