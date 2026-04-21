@echo off
echo Iniciando Remotion Studio + Record Server...
start "Record Server" cmd /k "node record-server.js"
timeout /t 2 /nobreak >nul
start "Remotion Studio" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul
start "" "http://localhost:3000"
start "" "http://localhost:3001/studio.html"
