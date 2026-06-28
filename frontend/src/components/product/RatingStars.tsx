import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

/** Accessible fractional star rating. Stars are decorative; the label carries it. */
export function RatingStars({ rating, className }: { rating: number | null; className?: string }) {
  if (rating == null) return null;
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label={`${rating} out of 5`}>
      <span className="relative inline-block" aria-hidden>
        <span className="flex text-border-strong">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="size-4" fill="currentColor" strokeWidth={0} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-accent-500" style={{ width: `${pct}%` }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="size-4 shrink-0" fill="currentColor" strokeWidth={0} />
          ))}
        </span>
      </span>
      <span className="tnum text-xs font-medium text-muted">{rating.toFixed(1)}</span>
    </span>
  );
}
