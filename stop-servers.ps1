# Agora Platform - Stop All Servers
# Run this script to stop all Node.js processes

Write-Host "========================================" -ForegroundColor Red
Write-Host "   AGORA PLATFORM - Stopping Servers" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Stop all Node processes
Write-Host "🛑 Stopping all Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

Start-Sleep -Seconds 2

# Verify
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  Some Node processes still running" -ForegroundColor Yellow
    $nodeProcesses | Format-Table Id, ProcessName, CPU -AutoSize
} else {
    Write-Host "✅ All servers stopped successfully!" -ForegroundColor Green
}

Write-Host ""
