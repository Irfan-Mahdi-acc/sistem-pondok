# Script untuk memperbaiki dan restart dev server
Write-Host "Memperbaiki dan Restart Dev Server..." -ForegroundColor Cyan

# 1. Matikan semua process Node.js
Write-Host "`n1. Menghentikan semua process Node.js..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# 2. Hapus lock file
Write-Host "2. Menghapus lock file..." -ForegroundColor Yellow
$lockPath = ".\.next\dev\lock"
if (Test-Path $lockPath) {
    Remove-Item -Force $lockPath
    Write-Host "   Lock file dihapus" -ForegroundColor Green
}

# 3. Hapus folder .prisma
Write-Host "3. Menghapus folder .prisma..." -ForegroundColor Yellow
$prismaPath = ".\node_modules\.prisma"
if (Test-Path $prismaPath) {
    Remove-Item -Recurse -Force $prismaPath
    Write-Host "   Folder .prisma dihapus" -ForegroundColor Green
}

# 4. Generate Prisma Client
Write-Host "4. Generate Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Prisma Client berhasil di-generate" -ForegroundColor Green
} else {
    Write-Host "   Gagal generate Prisma Client" -ForegroundColor Red
    exit 1
}

# 5. Jalankan dev server
Write-Host "`n5. Menjalankan dev server..." -ForegroundColor Yellow
Write-Host "   Server akan berjalan di http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Tekan Ctrl+C untuk menghentikan`n" -ForegroundColor Gray

npm run dev
