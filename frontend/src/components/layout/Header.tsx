"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/cart-context";

const NAV = [
  { href: "/products", label: "Shop all" },
  ...CATEGORIES.map((c) => ({ href: `/products?category=${c.slug}`, label: c.label })),
  { href: "/orders", label: "Orders" },
];

export function Header() {
  const { count, hydrated } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Close the mobile menu on navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" aria-label="Crux home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 md:block" role="search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gear…"
              aria-label="Search products"
              className="w-full rounded-xl border border-border-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus-visible:outline-2"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 md:ml-0 ml-auto">
          <button
            onClick={() => setCartOpen(true)}
            className="relative grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-primary-50"
            aria-label={`Open basket${hydrated && count > 0 ? `, ${count} items` : ""}`}
          >
            <ShoppingBag className="size-5" aria-hidden />
            {hydrated && count > 0 && (
              <span className="tnum absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[0.7rem] font-bold text-ink-strong">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-primary-50 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-surface lg:hidden",
          menuOpen ? "max-h-[28rem]" : "max-h-0",
          "transition-[max-height] duration-300 ease-out-quart",
        )}
      >
        <div className="container-page space-y-1 py-3">
          <form onSubmit={onSearch} role="search" className="mb-2 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gear…"
                aria-label="Search products"
                className="w-full rounded-xl border border-border-strong bg-surface py-2.5 pl-9 pr-3 text-sm focus-visible:outline-2"
              />
            </div>
          </form>
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-primary-50"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-primary-50">
            Admin
          </Link>
        </div>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
