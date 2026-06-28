import { TriangleAlert } from "lucide-react";

export function DemoAdminWarning() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-[oklch(0.5_0.12_70)]" aria-hidden />
      <div>
        <p className="font-semibold text-ink-strong">Demo admin area</p>
        <p className="mt-0.5 text-muted">
          This is an unsecured demo. The passcode is a single shared secret, not real authentication —
          anything you add here writes to the live demo database. Don&apos;t put anything sensitive in.
        </p>
      </div>
    </div>
  );
}
