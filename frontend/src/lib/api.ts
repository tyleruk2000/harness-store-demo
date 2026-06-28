/**
 * Typed API client.
 *
 * Base URL resolution is the linchpin of this app's portability:
 *   - In the BROWSER we call the same-origin relative `/api` path. A Next.js
 *     rewrite (next.config.js) proxies it to the backend, so there's no CORS and
 *     no backend URL baked into the client bundle.
 *   - On the SERVER (RSC / route handlers) we call the backend directly using the
 *     runtime `BACKEND_URL` env var.
 */

import { ApiError } from "@/types/api";
import type { CategoryInfo, Product, ProductInput, ProductQuery } from "@/types/product";
import type { Order, OrderInput } from "@/types/order";

function apiBase(): string {
  if (typeof window === "undefined") {
    return process.env.BACKEND_URL || "http://localhost:8000";
  }
  return "/api";
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Admin passcode sent as X-Admin-Passcode for guarded write endpoints. */
  adminPasscode?: string;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, adminPasscode, headers, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(adminPasscode ? { "X-Admin-Passcode": adminPasscode } : {}),
      ...headers,
    },
    // Demo freshness: never serve stale catalogue/order data.
    cache: rest.cache ?? "no-store",
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, init);
  } catch (err) {
    throw new ApiError(0, "Network error — is the backend running?", err);
  }

  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = await res.json();
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(res.status, messageFor(res.status, detail), detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function messageFor(status: number, detail: unknown): string {
  if (detail && typeof detail === "object" && "detail" in detail) {
    const d = (detail as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    if (d && typeof d === "object" && "message" in d) {
      return String((d as { message: unknown }).message);
    }
  }
  if (status === 401) return "Not authorised — check the admin passcode.";
  if (status === 404) return "Not found.";
  if (status === 409) return "That item just sold out — adjust the quantity.";
  if (status === 422) return "Please check the details and try again.";
  return `Request failed (${status}).`;
}

function queryString(query: ProductQuery): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.use_case) params.set("use_case", query.use_case);
  if (query.featured != null) params.set("featured", String(query.featured));
  if (query.search) params.set("search", query.search);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const api = {
  health: () => apiFetch<{ status: string; database: string }>("/health"),

  listProducts: (query: ProductQuery = {}) =>
    apiFetch<Product[]>(`/products${queryString(query)}`),

  getProduct: (id: number) => apiFetch<Product>(`/products/${id}`),

  getRelated: (id: number) => apiFetch<Product[]>(`/products/${id}/related`),

  featured: () => apiFetch<Product[]>("/products/featured"),

  categories: () => apiFetch<CategoryInfo[]>("/categories"),

  createProduct: (input: ProductInput, adminPasscode: string) =>
    apiFetch<Product>("/products", { method: "POST", body: input, adminPasscode }),

  updateProduct: (
    id: number,
    patch: Partial<Pick<Product, "featured" | "stock_quantity" | "price">>,
    adminPasscode: string,
  ) => apiFetch<Product>(`/products/${id}`, { method: "PATCH", body: patch, adminPasscode }),

  createOrder: (input: OrderInput) =>
    apiFetch<Order>("/orders", { method: "POST", body: input }),

  ordersByEmail: (email: string) =>
    apiFetch<Order[]>(`/orders/by-email/${encodeURIComponent(email)}`),

  getOrder: (id: number) => apiFetch<Order>(`/orders/${id}`),

  verifyAdmin: (adminPasscode: string) =>
    apiFetch<{ ok: boolean }>("/admin/verify", { adminPasscode }),
};

export { ApiError };
