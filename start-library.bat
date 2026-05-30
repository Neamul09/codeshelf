@echo off
title CodeShelf Library Local Server
echo ==========================================
echo CodeShelf - Local Web Server Launcher
echo ==========================================
echo.
echo Modern browsers restrict loading local files directly via double-click (CORS policy).
echo This script launches a lightweight local server to run CodeShelf at 100%% performance.
echo.

:: Detect Node.js and launch npx http-server
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Node.js detected. Launching with npx http-server...
    echo Launching http://localhost:8000 in your default browser...
    start http://localhost:8000
    npx -y http-server -p 8000
    goto end
)

:: Detect Python and launch python http.server
where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Python detected. Launching with python http.server...
    echo Launching http://localhost:8000 in your default browser...
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

:: Fallback warning if environment is missing
echo [WARN] Neither Node.js nor Python was detected in your Windows PATH environment.
echo Please install Node.js (https://nodejs.org) to run this launcher.
echo.
pause

:end
