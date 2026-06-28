// Lightweight liveness endpoint for the frontend container healthcheck.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", service: "frontend" });
}
