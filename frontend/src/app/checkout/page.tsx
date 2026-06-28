"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Lock, ShieldCheck } from "lucide-react";

import { Field, Input } from "@/components/ui/Field";
import { Button, buttonStyles } from "@/components/ui/Button";
import { PaymentSelector } from "@/components/checkout/PaymentSelector";
import { CartSummary } from "@/components/cart/CartSummary";
import { ProductImage } from "@/components/product/ProductImage";
import { EmptyState, Skeleton } from "@/components/ui/states";
import { useCart } from "@/lib/cart-context";
import { api, ApiError } from "@/lib/api";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import { formatPrice } from "@/lib/format";
import { STORAGE_KEYS } from "@/lib/constants";

export default function CheckoutPage() {
  const { items, subtotal, hydrated, clear } = useCart();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payment, setPayment] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = new FormData(e.currentTarget);
    const raw = {
      customer_name: form.get("customer_name"),
      customer_email: form.get("customer_email"),
      address: form.get("address"),
      city: form.get("city"),
      postcode: form.get("postcode"),
      country: form.get("country"),
      payment_method: payment,
    };
    const parsed = checkoutSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        ...parsed.data,
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
      });
      sessionStorage.setItem(STORAGE_KEYS.lastOrder, JSON.stringify(order));
      clear();
      router.push("/checkout/success");
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "We couldn't place your order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-9 w-48" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <h1 className="mb-8 font-display text-3xl font-semibold text-ink-strong">Checkout</h1>
        <EmptyState
          title="Nothing to check out"
          description="Add some gear to your basket first."
          action={
            <Link href="/products" className={buttonStyles({ size: "sm" })}>
              Browse gear
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold text-ink-strong sm:text-4xl">Checkout</h1>
      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
        <ShieldCheck className="size-4 text-success" aria-hidden /> Demo checkout — no real payment is taken.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-ink-strong">Shipping details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="customer_name" error={errors.customer_name} required className="sm:col-span-2">
                <Input id="customer_name" name="customer_name" autoComplete="name" invalid={!!errors.customer_name} placeholder="Alex Honnold" />
              </Field>
              <Field label="Email" htmlFor="customer_email" error={errors.customer_email} required className="sm:col-span-2">
                <Input id="customer_email" name="customer_email" type="email" autoComplete="email" invalid={!!errors.customer_email} placeholder="you@example.com" />
              </Field>
              <Field label="Street address" htmlFor="address" error={errors.address} required className="sm:col-span-2">
                <Input id="address" name="address" autoComplete="address-line1" invalid={!!errors.address} placeholder="1 Boulder Lane" />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city} required>
                <Input id="city" name="city" autoComplete="address-level2" invalid={!!errors.city} placeholder="Sheffield" />
              </Field>
              <Field label="Postcode" htmlFor="postcode" error={errors.postcode} required>
                <Input id="postcode" name="postcode" autoComplete="postal-code" invalid={!!errors.postcode} placeholder="S1 2AB" />
              </Field>
              <Field label="Country" htmlFor="country" error={errors.country} required className="sm:col-span-2">
                <Input id="country" name="country" autoComplete="country-name" defaultValue="United Kingdom" invalid={!!errors.country} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <PaymentSelector value={payment} onChange={setPayment} />
          </section>
        </div>

        <aside className="space-y-4 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold text-ink-strong">Order summary</h2>
          <ul className="max-h-64 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  <ProductImage src={item.image_url} alt={item.name} category={item.category} sizes="48px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-strong">{item.name}</span>
                  <span className="text-xs text-muted">Qty {item.qty}</span>
                </span>
                <span className="tnum text-sm font-medium text-ink">{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-4">
            <CartSummary subtotal={subtotal} />
          </div>
          {formError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger" role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            <Lock className="size-4" aria-hidden /> Send order
          </Button>
          <p className="text-center text-xs text-muted">By placing this demo order you agree to nothing at all.</p>
        </aside>
      </form>
    </div>
  );
}
