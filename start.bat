@echo off
title News Aggregator - Localhost
echo ===================================================
echo Starting News Aggregator Local Development Server...
echo ===================================================
echo.
cd /d "%~dp0client"
if exist "node_modules\vite\bin\vite.js" (
    call "C:\Program Files\nodejs\node.exe" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --open
) else (
    call npm.cmd run dev -- --open
)
pause

