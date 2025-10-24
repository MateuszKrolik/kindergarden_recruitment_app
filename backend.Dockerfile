# syntax=docker.io/docker/dockerfile:1
FROM node:23.10-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./

COPY apps/backend/package.json ./apps/backend/package.json

RUN pnpm install --prod --no-frozen-lockfile
RUN pnpm store prune

COPY apps/backend ./apps/backend

FROM node:23.10-alpine AS runtime
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend ./apps/backend

WORKDIR /app/apps/backend
USER node
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/index.ts"]
