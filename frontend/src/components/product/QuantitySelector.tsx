"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/cn";

export function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const btn =
    "grid place-items-center rounded-lg text-ink transition-colors hover:bg-primary-100 disabled:opacity-40 disabled:hover:bg-transparent";
  const dims = size === "sm" ? "size-8" : "size-10";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border-strong bg-surface p-1",
        className,
      )}
    >
      <button
        type="button"
        className={cn(btn, dims)}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className={cn("tnum min-w-8 text-center text-sm font-semibold", size === "md" && "min-w-10")}>
        {value}
      </span>
      <button
        type="button"
        className={cn(btn, dims)}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        title={value >= max ? "That's all we have in stock" : undefined}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
