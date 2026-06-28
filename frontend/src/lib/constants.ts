import type { Category, UseCase } from "@/types/product";

export const STORAGE_KEYS = {
  cart: "crux.cart.v1",
  lastOrder: "crux.lastOrder.v1",
  adminPasscode: "crux.adminPasscode.v1",
} as const;

/** Mirrors the backend commerce rules (display only — totals are server-side). */
export const SHIPPING_FLAT = 4.95;
export const FREE_SHIPPING_THRESHOLD = 75;

export const CATEGORIES: { slug: Category; label: string; blurb: string }[] = [
  { slug: "harnesses", label: "Harnesses", blurb: "Tie in with confidence" },
  { slug: "helmets", label: "Helmets", blurb: "Heads up, stay safe" },
  { slug: "ropes", label: "Ropes", blurb: "Your lifeline, sorted" },
  { slug: "carabiners", label: "Carabiners", blurb: "Clip, lock, send" },
];

export const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "sport", label: "Sport" },
  { value: "trad", label: "Trad" },
  { value: "alpine", label: "Alpine" },
  { value: "indoor", label: "Indoor" },
  { value: "big wall", label: "Big Wall" },
];

export const ORDER_STATUS_FLOW = [
  "pending",
  "paid",
  "packed",
  "shipped",
  "delivered",
] as const;
