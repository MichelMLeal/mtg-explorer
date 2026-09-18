# ── Build Stage ────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/

RUN pnpm --filter @mtg-explorer/shared build

# Path prefix the app is served under behind the shared lab Caddy proxy
# (e.g. /mtg/), and the matching API base the built JS should call.
ARG VITE_BASE=/
ARG VITE_API_URL=
ENV VITE_BASE=$VITE_BASE
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @mtg-explorer/web build

# ── Production Stage ──────────────────────────────────────
FROM nginx:alpine AS production

RUN addgroup -g 1001 -S web && adduser -S web -u 1001 -G web

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

USER web

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1
