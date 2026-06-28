// Same-origin /api proxy → backend.
//
// Implemented as a route handler (not a next.config rewrite) on purpose:
// rewrite destinations are baked at BUILD time, but BACKEND_URL must be read at
// RUNTIME so one image works across environments. This handler reads it per
// request and forwards method, body, and headers (incl. X-Admin-Passcode).

import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, ctx: { params: { path: string[] } }) {
  const backend = process.env.BACKEND_URL || "http://localhost:8000";
  const path = ctx.params.path.join("/");
  const target = `${backend}/${path}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  // Strip hop-by-hop / host headers; request plain (un-gzipped) responses.
  headers.delete("host");
  headers.delete("connection");
  headers.delete("accept-encoding");
  headers.delete("content-length");

  const init: RequestInit = { method: req.method, headers, redirect: "manual" };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(target, init);
  } catch {
    return Response.json(
      { detail: "Upstream backend unreachable." },
      { status: 502 },
    );
  }

  const body = await res.arrayBuffer();
  const respHeaders = new Headers(res.headers);
  respHeaders.delete("content-encoding");
  respHeaders.delete("content-length");
  respHeaders.delete("transfer-encoding");
  return new Response(body, { status: res.status, headers: respHeaders });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
};
