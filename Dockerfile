# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma generate requires a syntactically valid URL at build time.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build?schema=public
ENV SKIP_ENV_VALIDATION=1
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
RUN pnpm prisma generate
RUN pnpm build

FROM base AS migrate
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY package.json pnpm-lock.yaml ./
ENV SKIP_ENV_VALIDATION=1
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

FROM base AS worker
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY server ./server
COPY scripts ./scripts
ENV NODE_ENV=production
ENV MAINTAINERAI_WORKER=1
CMD ["pnpm", "exec", "tsx", "--tsconfig", "tsconfig.json", "scripts/worker.ts"]

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache wget openssl \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/live || exit 1

CMD ["node", "server.js"]
