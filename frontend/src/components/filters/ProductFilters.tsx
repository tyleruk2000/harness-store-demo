"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Select } from "@/components/ui/Field";
import { CATEGORIES, USE_CASES } from "@/lib/constants";
import { cn } from "@/lib/cn";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const current = {
    category: params.get("category") ?? "",
    use_case: params.get("use_case") ?? "",
    sort: params.get("sort") ?? "featured",
  };

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Pill active={!current.category} onClick={() => setParam("category", "")}>
          All gear
        </Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c.slug} active={current.category === c.slug} onClick={() => setParam("category", c.slug)}>
            {c.label}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          Use
          <Select
            className="h-9 w-auto py-1.5 text-sm"
            value={current.use_case}
            onChange={(e) => setParam("use_case", e.target.value)}
            aria-label="Filter by use case"
          >
            <option value="">Any</option>
            {USE_CASES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Sort
          <Select
            className="h-9 w-auto py-1.5 text-sm"
            value={current.sort}
            onChange={(e) => setParam("sort", e.target.value)}
            aria-label="Sort products"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-border-strong bg-surface text-ink hover:border-primary-300 hover:bg-primary-50",
      )}
    >
      {children}
    </button>
  );
}
