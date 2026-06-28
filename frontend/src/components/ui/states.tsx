import type { ReactNode } from "react";
import { AlertTriangle, PackageOpen } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

/** Skeleton block for loading states (shimmer respects reduced-motion). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface-2 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="grid size-12 place-items-center rounded-2xl bg-primary-100 text-primary-700">
        {icon ?? <PackageOpen className="size-6" aria-hidden />}
      </div>
      <h3 className="text-lg font-semibold text-ink-strong">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/25 bg-danger/5 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <div className="grid size-12 place-items-center rounded-2xl bg-danger/12 text-danger">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-ink-strong">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
