import { CheckCircle2, CircleAlert, CircleSlash } from "lucide-react";

import { Badge } from "@/components/ui/Badge";

/** Stock state — encoded with icon + text, never colour alone (a11y). */
export function StockBadge({ stock, lowAt = 6 }: { stock: number; lowAt?: number }) {
  if (stock <= 0) {
    return (
      <Badge tone="danger" icon={<CircleSlash className="size-3.5" aria-hidden />}>
        Out of stock
      </Badge>
    );
  }
  if (stock <= lowAt) {
    return (
      <Badge tone="warning" icon={<CircleAlert className="size-3.5" aria-hidden />}>
        Only {stock} left
      </Badge>
    );
  }
  return (
    <Badge tone="success" icon={<CheckCircle2 className="size-3.5" aria-hidden />}>
      In stock
    </Badge>
  );
}
