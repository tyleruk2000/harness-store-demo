import Link from "next/link";

import { buttonStyles } from "@/components/ui/Button";

export default function ProductNotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-28 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink-strong">Gear not found</h1>
      <p className="mt-3 max-w-md text-muted">
        That product isn&apos;t on the shelf. It may have sold out or been removed.
      </p>
      <Link href="/products" className={buttonStyles({ className: "mt-7" })}>
        Back to the shop
      </Link>
    </div>
  );
}
