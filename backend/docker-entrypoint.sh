#!/bin/bash
set -e

echo "=== Initializing Halal Sheba Backend ==="

# Wait for database if DATABASE_URL or DB_HOST is provided
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    php artisan migrate --force --isolated || true
fi

# Ensure catalog products are imported if database is fresh
php artisan catalog:import || true

# Cache configs and routes for production performance
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
fi

PORT_NUMBER="${PORT:-8000}"
echo "=== Starting Server on 0.0.0.0:${PORT_NUMBER} ==="
exec php artisan serve --host=0.0.0.0 --port="${PORT_NUMBER}"
