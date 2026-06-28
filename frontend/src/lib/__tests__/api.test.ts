import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";

import { api } from "@/lib/api";
import { ApiError } from "@/types/api";
import { server } from "@/test/msw/server";

describe("api client", () => {
  it("lists products via the same-origin /api base", async () => {
    const products = await api.listProducts();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Cloudloop Sport Harness");
  });

  it("builds a query string from filters", async () => {
    let seen = "";
    server.use(
      http.get("http://localhost:3000/api/products", ({ request }) => {
        seen = new URL(request.url).search;
        return HttpResponse.json([]);
      }),
    );
    await api.listProducts({ category: "ropes", featured: true, search: "dry" });
    expect(seen).toContain("category=ropes");
    expect(seen).toContain("featured=true");
    expect(seen).toContain("search=dry");
  });

  it("injects the admin passcode header on createProduct", async () => {
    let header: string | null = null;
    server.use(
      http.post("http://localhost:3000/api/products", ({ request }) => {
        header = request.headers.get("X-Admin-Passcode");
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );
    await api.createProduct({} as never, "belay-on");
    expect(header).toBe("belay-on");
  });

  it("throws ApiError with status on a non-2xx response", async () => {
    server.use(
      http.get("http://localhost:3000/api/products/:id", () =>
        HttpResponse.json({ detail: "Product not found" }, { status: 404 }),
      ),
    );
    await expect(api.getProduct(123)).rejects.toMatchObject({ status: 404 });
    await expect(api.getProduct(123)).rejects.toBeInstanceOf(ApiError);
  });

  it("surfaces a friendly message for a 409 stock conflict", async () => {
    server.use(
      http.post("http://localhost:3000/api/orders", () =>
        HttpResponse.json({ detail: { message: "Insufficient stock for product 1" } }, { status: 409 }),
      ),
    );
    await expect(api.createOrder({} as never)).rejects.toMatchObject({
      status: 409,
      message: "Insufficient stock for product 1",
    });
  });
});
