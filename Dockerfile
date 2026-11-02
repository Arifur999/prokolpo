# syntax=docker/dockerfile:1
# Next.js standalone image. Nothing environment-specific is baked in:
# API_BASE_URL is read at runtime, so one image runs against any backend.
#   docker build -t myapp-web .
#   docker run -p 3000:3000 -e API_BASE_URL=http://api:5000/api/v1 myapp-web

ARG NODE_VERSION=24.20-alpine

FROM node:${NODE_VERSION} AS base
# Same version as package.json#packageManager, so the lockfile is read by the pnpm that wrote it.
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate
WORKDIR /app

FROM base AS deps
# pnpm-workspace.yaml* : copied when present (pnpm keeps build-script approvals there).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# The node image ships an unprivileged `node` user; the server never needs root.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000

# /api/health needs no session and no backend, so 200 means "this server is up".
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
