import { describe, expect, it } from "vitest";

import { checkoutSchema, fieldErrors, productSchema } from "@/lib/validation";

describe("checkout validation", () => {
  const valid = {
    customer_name: "Alex",
    customer_email: "alex@example.com",
    address: "1 Crag Rd",
    city: "Sheffield",
    postcode: "S1 2AB",
    country: "United Kingdom",
    payment_method: "card",
  };

  it("accepts a complete form", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a bad email", () => {
    const res = checkoutSchema.safeParse({ ...valid, customer_email: "nope" });
    expect(res.success).toBe(false);
    if (!res.success) expect(fieldErrors(res.error).customer_email).toMatch(/valid email/i);
  });

  it("rejects missing required fields", () => {
    const res = checkoutSchema.safeParse({ ...valid, city: "" });
    expect(res.success).toBe(false);
    if (!res.success) expect(fieldErrors(res.error).city).toBeTruthy();
  });
});

describe("product validation", () => {
  const base = {
    name: "Test",
    category: "harnesses",
    short_description: "short",
    price: "50",
    stock_quantity: "5",
    use_case: "sport",
  };

  it("coerces numeric strings", () => {
    const res = productSchema.safeParse(base);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.price).toBe(50);
      expect(res.data.stock_quantity).toBe(5);
    }
  });

  it("rejects a negative price", () => {
    const res = productSchema.safeParse({ ...base, price: "-1" });
    expect(res.success).toBe(false);
  });

  it("rejects an invalid use case", () => {
    const res = productSchema.safeParse({ ...base, use_case: "spaceflight" });
    expect(res.success).toBe(false);
  });
});
