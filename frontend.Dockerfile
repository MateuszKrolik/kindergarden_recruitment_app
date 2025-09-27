# syntax=docker.io/docker/dockerfile:1
FROM node:23.10-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN corepack enable pnpm && pnpm --filter frontend... install --frozen-lockfile

COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared

RUN corepack enable pnpm && pnpm --filter frontend run build
RUN pnpm store prune

FROM node:23.10-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

WORKDIR /app/apps/frontend
USER nextjs
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
