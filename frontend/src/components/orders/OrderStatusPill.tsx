import { Clock, CreditCard, PackageCheck, Truck, Home } from "lucide-react";

import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types/order";

const MAP: Record<OrderStatus, { tone: BadgeTone; label: string; Icon: typeof Clock }> = {
  pending: { tone: "neutral", label: "Pending", Icon: Clock },
  paid: { tone: "success", label: "Paid", Icon: CreditCard },
  packed: { tone: "info", label: "Packed", Icon: PackageCheck },
  shipped: { tone: "primary", label: "Shipped", Icon: Truck },
  delivered: { tone: "success", label: "Delivered", Icon: Home },
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const { tone, label, Icon } = MAP[status] ?? MAP.pending;
  return (
    <Badge tone={tone} icon={<Icon className="size-3.5" aria-hidden />}>
      {label}
    </Badge>
  );
}
