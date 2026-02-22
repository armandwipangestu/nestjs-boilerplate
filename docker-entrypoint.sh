#!/bin/bash
set -e

echo "🚀 Starting entrypoint script..."

# Run migrations
echo "🔄 Running database migrations..."
bun run prisma:migrate:deploy

# Run seeder if in development mode
if [ "$NODE_ENV" = "development" ]; then
    echo "🌱 Running database seeder..."
    bun run prisma:seed
fi

echo "✅ Entrypoint script finished. Executing command..."

# Execute the passed command
exec "$@"
