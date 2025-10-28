# Agora Platform - Start Both Servers
# Run this script to start backend and frontend together

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AGORA PLATFORM - Starting Servers" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    exit 1
}

# Kill any existing Node processes
Write-Host "🔄 Stopping any existing servers..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# Start Backend in new window
Write-Host "🚀 Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', @"
cd '$PSScriptRoot\server'
`$host.UI.RawUI.WindowTitle = 'Agora Backend - Port 5000'
Write-Host '========================================' -ForegroundColor Green
Write-Host '   AGORA BACKEND SERVER' -ForegroundColor White
Write-Host '   http://localhost:5000' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
node server.js
"@

Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "🚀 Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Write-Host "   (This will take 30-60 seconds to compile)" -ForegroundColor Yellow
Start-Process powershell -ArgumentList '-NoExit', '-Command', @"
cd '$PSScriptRoot'
`$host.UI.RawUI.WindowTitle = 'Agora Frontend - Port 3000'
Write-Host '========================================' -ForegroundColor Green
Write-Host '   AGORA FRONTEND SERVER' -ForegroundColor White
Write-Host '   http://localhost:3000' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
Write-Host 'Compiling React app (please wait)...' -ForegroundColor Yellow
Write-Host ''
npm start
"@

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Server URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:3000 (wait for compilation)" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop: Close the PowerShell windows or run stop-servers.ps1" -ForegroundColor Yellow
Write-Host ""
