import { http, HttpResponse } from "msw";

import { sampleOrder, sampleProduct } from "@/test/fixtures";

const BASE = "http://localhost:3000/api";

export const handlers = [
  http.get(`${BASE}/health`, () =>
    HttpResponse.json({ status: "ok", service: "backend", database: "connected" }),
  ),
  http.get(`${BASE}/products`, () => HttpResponse.json([sampleProduct])),
  http.get(`${BASE}/products/featured`, () => HttpResponse.json([sampleProduct])),
  http.get(`${BASE}/products/:id`, ({ params }) =>
    HttpResponse.json({ ...sampleProduct, id: Number(params.id) }),
  ),
  http.get(`${BASE}/categories`, () =>
    HttpResponse.json([{ name: "harnesses", count: 5 }]),
  ),
  http.post(`${BASE}/products`, ({ request }) => {
    if (request.headers.get("X-Admin-Passcode") !== "belay-on") {
      return HttpResponse.json({ detail: "Invalid passcode" }, { status: 401 });
    }
    return HttpResponse.json({ ...sampleProduct, id: 99 }, { status: 201 });
  }),
  http.get(`${BASE}/admin/verify`, ({ request }) =>
    request.headers.get("X-Admin-Passcode") === "belay-on"
      ? HttpResponse.json({ ok: true })
      : HttpResponse.json({ detail: "Invalid passcode" }, { status: 401 }),
  ),
  http.post(`${BASE}/orders`, () => HttpResponse.json(sampleOrder, { status: 201 })),
  http.get(`${BASE}/orders/by-email/:email`, () => HttpResponse.json([sampleOrder])),
];
