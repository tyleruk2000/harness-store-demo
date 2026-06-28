"use client";

import { useState, type FormEvent } from "react";
import { PlusCircle } from "lucide-react";

import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { CATEGORIES, USE_CASES } from "@/lib/constants";
import { fieldErrors, productSchema } from "@/lib/validation";
import type { Product } from "@/types/product";

export function AddProductForm({
  passcode,
  onCreated,
}: {
  passcode: string;
  onCreated: (product: Product) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: fd.get("name"),
      category: fd.get("category"),
      short_description: fd.get("short_description"),
      long_description: fd.get("long_description") ?? "",
      price: fd.get("price"),
      image_url: fd.get("image_url") ?? "",
      stock_quantity: fd.get("stock_quantity"),
      weight: fd.get("weight") || null,
      colour: fd.get("colour") || null,
      use_case: fd.get("use_case"),
      rating: fd.get("rating") || null,
      featured: fd.get("featured") === "on",
    };
    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const product = await api.createProduct(
        {
          ...parsed.data,
          long_description: parsed.data.long_description ?? "",
          image_url: parsed.data.image_url ?? "",
          weight: parsed.data.weight ?? null,
          colour: parsed.data.colour ?? null,
          rating: parsed.data.rating ?? null,
        },
        passcode,
      );
      onCreated(product);
      setSuccess(`Added “${product.name}” to the catalogue.`);
      e.currentTarget.reset();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't add the product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink-strong">Add a product</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="p-name" error={errors.name} required className="sm:col-span-2">
          <Input id="p-name" name="name" invalid={!!errors.name} placeholder="Featherlock Screwgate" />
        </Field>

        <Field label="Category" htmlFor="p-category" error={errors.category} required>
          <Select id="p-category" name="category" defaultValue="harnesses" invalid={!!errors.category}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Best for" htmlFor="p-usecase" error={errors.use_case} required>
          <Select id="p-usecase" name="use_case" defaultValue="sport" invalid={!!errors.use_case}>
            {USE_CASES.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Short description" htmlFor="p-short" error={errors.short_description} required className="sm:col-span-2">
          <Input id="p-short" name="short_description" invalid={!!errors.short_description} placeholder="One punchy line about the gear" />
        </Field>

        <Field label="Long description" htmlFor="p-long" error={errors.long_description} className="sm:col-span-2">
          <Textarea id="p-long" name="long_description" placeholder="The full pitch…" />
        </Field>

        <Field label="Price (£)" htmlFor="p-price" error={errors.price} required>
          <Input id="p-price" name="price" type="number" step="0.01" min="0" invalid={!!errors.price} placeholder="89.00" />
        </Field>

        <Field label="Stock quantity" htmlFor="p-stock" error={errors.stock_quantity} required>
          <Input id="p-stock" name="stock_quantity" type="number" min="0" defaultValue={10} invalid={!!errors.stock_quantity} />
        </Field>

        <Field label="Weight (g)" htmlFor="p-weight" hint="Optional">
          <Input id="p-weight" name="weight" type="number" step="0.1" min="0" placeholder="320" />
        </Field>

        <Field label="Colour" htmlFor="p-colour" hint="Optional">
          <Input id="p-colour" name="colour" placeholder="Chalk Blue" />
        </Field>

        <Field label="Rating (0–5)" htmlFor="p-rating" hint="Optional">
          <Input id="p-rating" name="rating" type="number" step="0.1" min="0" max="5" placeholder="4.7" />
        </Field>

        <Field label="Image URL" htmlFor="p-image" hint="Optional — a branded placeholder shows if blank">
          <Input id="p-image" name="image_url" placeholder="/images/products/your-product.webp" />
        </Field>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" name="featured" className="size-4 rounded border-border-strong accent-primary-600" />
          <span className="text-sm text-ink">Mark as a featured “crew pick”</span>
        </label>
      </div>

      {formError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger" role="alert">{formError}</p>
      )}
      {success && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success" role="status">{success}</p>
      )}

      <Button type="submit" loading={submitting}>
        <PlusCircle className="size-4" aria-hidden /> Add product
      </Button>
    </form>
  );
}
