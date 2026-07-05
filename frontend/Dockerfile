# syntax=docker/dockerfile:1
# Frontend image (Next.js standalone output). Build context is ./frontend.

# ---------- deps ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app
# NEXT_PUBLIC_* is baked at build time. We bake only the constant relative base
# so the same image runs in every environment; the real backend address is the
# runtime BACKEND_URL env (read by next.config.js rewrites at server start).
ARG NEXT_PUBLIC_API_BASE_URL=/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner (non-root) ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --create-home nextjs
# Standalone server + the static assets and public/ it serves.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Startup wrapper that raises the HTTP keepAliveTimeout to avoid the browser
# reusing a server-closed idle connection (the checkout "Network error" bug).
COPY --chown=nextjs:nodejs server-entry.js ./server-entry.js
USER nextjs
EXPOSE 3000
CMD ["node", "server-entry.js"]

# ---------- test (Vitest unit/component) ----------
FROM node:20-bookworm-slim AS test
WORKDIR /app
ENV CI=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "test"]
