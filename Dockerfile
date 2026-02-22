# =========================
# 1. Build Stage
# =========================
FROM oven/bun:1.2.23-alpine AS builder

LABEL org.opencontainers.image.source="https://github.com/arman/nestjs-boilerplate"
LABEL org.opencontainers.image.description="NestJS Boilerplate"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Inject dummy DATABASE_URL for prisma generate
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}

# Install all dependencies
COPY package.json bun.lock* package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN bun install --frozen-lockfile
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

# Copy only needed files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock* ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/yarn.lock* ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY docker-entrypoint.sh ./

# Remove dev dependencies (cleaner)
RUN bun install --production --frozen-lockfile

RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Entrypoint to run migrations/seeding
ENTRYPOINT ["./docker-entrypoint.sh"]

# Start NestJS
CMD ["bun", "run", "start:prod"]
