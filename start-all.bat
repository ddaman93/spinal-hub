@echo off
title Resume Builder - Development Server
cd "C:\Users\dylan.whalen\Downloads\Spinal-hub\Resume-Builder"

echo ============================================
echo  Starting Resume Builder Development Servers
echo ============================================
echo.
echo Starting Express server (port 5000)...
start "Express Server" cmd /k "node node_modules/tsx/dist/cli.mjs server/index.ts"

timeout /t 2 /nobreak

echo Starting Expo dev server (port 8081)...
start "Expo Dev Server" cmd /k "npx expo start --localhost --port 8081"

echo.
echo ============================================
echo  Servers starting...
echo  - Backend API: http://localhost:5000
echo  - Frontend App: http://localhost:8081
echo ============================================
echo.
pause
