import { z } from "zod";

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(1, "Please tell us your name").max(120),
  customer_email: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(1, "Street address is required").max(255),
  city: z.string().trim().min(1, "City is required").max(120),
  postcode: z.string().trim().min(1, "Postcode is required").max(20),
  country: z.string().trim().min(1, "Country is required").max(80),
  payment_method: z.enum(["card", "paypal", "klarna", "demo-credit"]),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  category: z.enum(["harnesses", "helmets", "ropes", "carabiners"]),
  short_description: z.string().trim().min(1, "A short description helps shoppers").max(300),
  long_description: z.string().trim().max(5000).default(""),
  price: z.coerce.number().min(0, "Price can't be negative").max(99999),
  image_url: z.string().trim().max(500).default(""),
  stock_quantity: z.coerce.number().int().min(0, "Stock can't be negative").max(100000),
  weight: z.coerce.number().min(0).max(100000).nullable().optional(),
  colour: z.string().trim().max(60).nullable().optional(),
  use_case: z.enum(["sport", "trad", "alpine", "indoor", "big wall"]),
  rating: z.coerce.number().min(0).max(5).nullable().optional(),
  featured: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productSchema>;

/** Flatten Zod errors into a { field: message } map for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
