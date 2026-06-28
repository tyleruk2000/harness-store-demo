/** @type {import('next').NextConfig} */

// The browser talks to the backend via the same-origin `/api` proxy, which is a
// route handler (src/app/api/[...path]/route.ts) that reads BACKEND_URL at
// RUNTIME — NOT a rewrite here, because rewrite destinations are baked at build
// time and couldn't vary per environment. See src/lib/api.ts.
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Product images are pre-sized local assets — skip the runtime optimizer so
  // the app has zero image dependencies in constrained/offline containers.
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
