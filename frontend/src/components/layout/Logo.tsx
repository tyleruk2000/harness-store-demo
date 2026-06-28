import { cn } from "@/lib/cn";

/** Crux wordmark with a carabiner-loop monogram. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path
            d="M12 3.5c-3.6 0-6 2.9-6 7v5.2a3.3 3.3 0 0 0 6.6 0V9.4a1.6 1.6 0 0 1 3.2 0v1.1"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <circle cx="15.8" cy="10.2" r="1.5" fill="currentColor" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink-strong">
        Cru<span className="text-primary-600">x</span>
      </span>
    </span>
  );
}
