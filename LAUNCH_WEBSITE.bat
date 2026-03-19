@echo off
TITLE Galimandi Launcher
echo ==========================================
echo    GALIMANDI WEBSITE LAUNCHER
echo ==========================================
echo.

echo [1/3] Closing any old/stuck server processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo [2/3] Clearing website cache and starting...
echo.
echo The website will open at: http://localhost:3005
echo.

:: Start the dev server in a new window
start cmd /k "npm run dev:force"

echo [3/3] Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:3005

echo.
echo ==========================================
echo    ALL DONE! Server is running in the
echo    other terminal window. 
echo ==========================================
pause
