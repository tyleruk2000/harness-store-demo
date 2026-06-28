import { Container } from "lucide-react";

import { cn } from "@/lib/cn";

/** Playful "this is a containerised demo" badge. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted",
        className,
      )}
    >
      <span className="grid size-5 place-items-center rounded-full bg-primary-100 text-primary-700">
        <Container className="size-3" aria-hidden />
      </span>
      Built for demo · Docker-powered, Kubernetes-ready
    </span>
  );
}
