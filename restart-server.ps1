# Stop any running npm process
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a bit
Start-Sleep -Seconds 2

# Run prisma generate
Write-Host "Running prisma generate..." -ForegroundColor Green
npx prisma generate

# Wait a bit
Start-Sleep -Seconds 2

# Start dev server
Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev
