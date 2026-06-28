import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

export const sampleProduct: Product = {
  id: 1,
  name: "Cloudloop Sport Harness",
  category: "harnesses",
  short_description: "Featherlight all-day sport harness.",
  long_description: "Long description here.",
  price: 89,
  image_url: "/images/products/cloudloop-sport-harness.webp",
  stock_quantity: 12,
  weight: 320,
  colour: "Chalk Blue",
  use_case: "sport",
  rating: 4.7,
  featured: true,
};

export const outOfStockProduct: Product = {
  ...sampleProduct,
  id: 2,
  name: "Sold Out Helmet",
  category: "helmets",
  stock_quantity: 0,
  featured: false,
};

export const lowStockProduct: Product = {
  ...sampleProduct,
  id: 3,
  name: "Almost Gone Rope",
  category: "ropes",
  stock_quantity: 3,
};

export const sampleOrder: Order = {
  id: 1,
  order_number: "CRX-20260101-ABCD1234",
  customer_email: "demo@example.com",
  customer_name: "Demo Climber",
  address: "1 Boulder Lane",
  city: "Sheffield",
  postcode: "S1 2AB",
  country: "United Kingdom",
  payment_method: "card",
  status: "paid",
  subtotal: 178,
  shipping: 0,
  total: 178,
  created_at: "2026-01-01T10:00:00Z",
  items: [
    { product_id: 1, product_name: "Cloudloop Sport Harness", unit_price: 89, quantity: 2, line_total: 178 },
  ],
};
