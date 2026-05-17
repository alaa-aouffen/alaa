#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Railway injects all environment variables directly into the container's
# process environment, so no .env file is needed.  We explicitly clear any
# cached config so Laravel reads the live environment variables on every
# start rather than falling back to the values that were baked in at build
# time.
# ---------------------------------------------------------------------------

echo "==> Clearing cached configuration..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Generate APP_KEY if one has not been provided via the environment.
if [ -z "$APP_KEY" ]; then
    echo "==> APP_KEY not set — generating a new one..."
    php artisan key:generate --force
fi

# Run database migrations automatically on every deploy.
echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Starting Laravel development server on 0.0.0.0:8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
