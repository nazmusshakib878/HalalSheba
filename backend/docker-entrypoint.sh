#!/bin/bash
set -e

echo "=== Initializing Halal Sheba Backend ==="

# Fallback APP_KEY if empty or invalid
if [ -z "$APP_KEY" ] || [[ "$APP_KEY" != base64:* ]]; then
    export APP_KEY="base64:zEaFh3kbooR+9eZEAfhQ/v/LeLqrZlKgVo3IBevX9oI="
fi

# Run database migrations and seeding
echo "Running database migrations..."
php artisan migrate --force || true

# Seed catalog if empty
echo "Importing catalog..."
php artisan catalog:import || true

# Ensure super admin exists
echo "Checking admin account..."
php artisan tinker --execute="if(!App\Models\User::where('email','halalsheba878@gmail.com')->exists()) { \$u=new App\Models\User; \$u->forceFill(['name'=>'Halal Sheba','email'=>'halalsheba878@gmail.com','password'=>Illuminate\Support\Facades\Hash::make('HalalSheba@2026'),'role'=>'super_admin','active'=>true])->save(); echo 'Admin created'; }" || true

PORT_NUMBER="${PORT:-8000}"
echo "=== Starting Server on 0.0.0.0:${PORT_NUMBER} ==="
exec php artisan serve --host=0.0.0.0 --port="${PORT_NUMBER}"
