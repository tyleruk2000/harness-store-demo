export type OrderStatus = "pending" | "paid" | "packed" | "shipped" | "delivered";

export interface OrderItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_email: string;
  customer_name: string | null;
  address: string;
  city: string;
  postcode: string;
  country: string;
  payment_method: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface OrderInput {
  customer_email: string;
  customer_name?: string | null;
  address: string;
  city: string;
  postcode: string;
  country: string;
  payment_method: string;
  items: OrderItemInput[];
}
