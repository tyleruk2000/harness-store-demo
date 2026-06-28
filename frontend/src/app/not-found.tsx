import Link from "next/link";

import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-28 text-center">
      <p className="font-mono text-sm font-semibold text-accent-600">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink-strong">Off route</h1>
      <p className="mt-3 max-w-md text-muted">
        We couldn&apos;t find that page. It might have been re-bolted, or never existed.
      </p>
      <Link href="/" className={buttonStyles({ className: "mt-7" })}>
        Back to base camp
      </Link>
    </div>
  );
}
