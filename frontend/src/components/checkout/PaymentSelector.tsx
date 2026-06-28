"use client";

import { CreditCard, Landmark, Wallet } from "lucide-react";

import { cn } from "@/lib/cn";

const METHODS = [
  { value: "card", label: "Card", hint: "Visa, Mastercard", icon: CreditCard },
  { value: "paypal", label: "PayPal", hint: "Pay in your account", icon: Wallet },
  { value: "klarna", label: "Klarna", hint: "Pay in 3", icon: Landmark },
  { value: "demo-credit", label: "Demo credit", hint: "Free in this demo", icon: Wallet },
] as const;

export function PaymentSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-strong">Payment method</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = value === m.value;
          return (
            <label
              key={m.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                active
                  ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600"
                  : "border-border-strong bg-surface hover:border-primary-300",
              )}
            >
              <input
                type="radio"
                name="payment_method"
                value={m.value}
                checked={active}
                onChange={() => onChange(m.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-lg",
                  active ? "bg-primary-600 text-white" : "bg-primary-100 text-primary-700",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-strong">{m.label}</span>
                <span className="block text-xs text-muted">{m.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
