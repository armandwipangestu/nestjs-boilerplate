# =========================
# 1. Build Stage
# =========================
FROM oven/bun:1.2.23-alpine AS base

LABEL org.opencontainers.image.source="https://github.com/arman/nestjs-boilerplate"
LABEL org.opencontainers.image.description="NestJS Boilerplate"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Install all dependencies
COPY package.json bun.lock* package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build NestJS
RUN bun run build

# =========================
# 2. Production Stage
# =========================
FROM oven/bun:1.2.23-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install bash
RUN apk add --no-cache bash

# Install production dependencies
COPY package.json bun.lock* package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN bun install --frozen-lockfile --production

# Copy build artifacts
COPY --from=base /app/dist ./dist

# Use non-root user for security
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs
USER nestjs

# Expose port
EXPOSE 3000

# Start NestJS
CMD ["bun", "run", "start:prod"]
