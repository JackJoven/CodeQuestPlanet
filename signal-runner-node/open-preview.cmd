@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found in PATH.
  echo Install Node.js or run server.mjs with an available Node runtime.
  pause
  exit /b 1
)

echo Signal Runner preview: http://127.0.0.1:4173
start "" "http://127.0.0.1:4173"
node server.mjs 4173
pause
