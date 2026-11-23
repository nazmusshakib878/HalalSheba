@echo off
title Halal Sheba Runner
echo ========================================================
echo        Halal Sheba - Starting Servers
echo ========================================================
echo.

:: Free ports 8000 and 3000 if already in use by old processes
echo [1/3] Checking and freeing ports 8000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":8000.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":3000.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Start Laravel Backend in a separate window
echo [2/3] Starting Backend on http://127.0.0.1:8000...
start "Halal Sheba - Backend" cmd /k "cd /d %~dp0backend && php artisan serve --port=8000"

:: Start Next.js Frontend in a separate window
echo [3/3] Starting Frontend on http://localhost:3000...
start "Halal Sheba - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Servers started successfully!
echo   - Storefront:   http://localhost:3000
echo   - Admin Panel:  http://localhost:3000/admin
echo   - Backend API:  http://127.0.0.1:8000
echo ========================================================
echo.
ping 127.0.0.1 -n 4 >nul
