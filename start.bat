@echo off
echo ========================================
echo    API Dashboard Starting...
echo ========================================
echo.

echo [1/2] Starting backend...
cd /d "%~dp0backend"
start "Backend" cmd /k "npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Starting frontend...
cd /d "%~dp0frontend"
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Services starting...
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo ========================================
echo.
timeout /t 3 /nobreak >nul
start http://localhost:5173
