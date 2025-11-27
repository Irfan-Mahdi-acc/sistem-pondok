# Script Backup Lengkap - All Critical Files
# Backup database, env, dan files penting lainnya

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BACKUP LENGKAP - Sistem Pondok" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Pindah ke folder project
cd "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"

# Timestamp untuk semua backup
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$mainBackupDir = "backups\full_backup_$timestamp"

Write-Host "📦 Membuat folder backup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $mainBackupDir -Force | Out-Null

$totalSize = 0

# 1. Backup Database
Write-Host ""
Write-Host "1️⃣  Backup Database..." -ForegroundColor Cyan
if (Test-Path "prisma\dev.db") {
    $dbBackupDir = "$mainBackupDir\database"
    New-Item -ItemType Directory -Path $dbBackupDir -Force | Out-Null
    Copy-Item -Path "prisma\dev.db" -Destination "$dbBackupDir\dev.db" -Force
    $dbSize = (Get-Item "$dbBackupDir\dev.db").Length
    $totalSize += $dbSize
    Write-Host "   ✓ Database backup: $([math]::Round($dbSize/1MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Database tidak ditemukan" -ForegroundColor Yellow
}

# 2. Backup Environment Variables
Write-Host ""
Write-Host "2️⃣  Backup Environment Variables..." -ForegroundColor Cyan
if (Test-Path ".env") {
    $envBackupDir = "$mainBackupDir\env"
    New-Item -ItemType Directory -Path $envBackupDir -Force | Out-Null
    Copy-Item -Path ".env" -Destination "$envBackupDir\.env" -Force
    $envSize = (Get-Item "$envBackupDir\.env").Length
    $totalSize += $envSize
    Write-Host "   ✓ .env backup: $([math]::Round($envSize/1KB, 2)) KB" -ForegroundColor Green
} else {
    Write-Host "   ⚠ File .env tidak ditemukan" -ForegroundColor Yellow
}

# 3. Backup Uploads (sample - jangan backup semua jika terlalu besar)
Write-Host ""
Write-Host "3️⃣  Checking Uploads..." -ForegroundColor Cyan
$uploadsDir = "public\uploads"
if (Test-Path $uploadsDir) {
    $uploadFiles = Get-ChildItem -Path $uploadsDir -File -Recurse
    $uploadCount = $uploadFiles.Count
    $uploadSize = ($uploadFiles | Measure-Object -Property Length -Sum).Sum
    
    if ($uploadSize -gt 100MB) {
        Write-Host "   ⚠ Uploads terlalu besar ($([math]::Round($uploadSize/1MB, 2)) MB)" -ForegroundColor Yellow
        Write-Host "   ℹ Disarankan backup manual ke external drive" -ForegroundColor Yellow
    } else {
        Write-Host "   ℹ Backup uploads ($uploadCount files, $([math]::Round($uploadSize/1MB, 2)) MB)..." -ForegroundColor Cyan
        $uploadsBackupDir = "$mainBackupDir\uploads"
        Copy-Item -Path $uploadsDir -Destination $uploadsBackupDir -Recurse -Force
        $totalSize += $uploadSize
        Write-Host "   ✓ Uploads backup complete" -ForegroundColor Green
    }
} else {
    Write-Host "   ℹ No uploads to backup" -ForegroundColor Gray
}

# 4. Backup Prisma Schema
Write-Host ""
Write-Host "4️⃣  Backup Prisma Schema..." -ForegroundColor Cyan
if (Test-Path "prisma\schema.prisma") {
    $schemaBackupDir = "$mainBackupDir\schema"
    New-Item -ItemType Directory -Path $schemaBackupDir -Force | Out-Null
    Copy-Item -Path "prisma\schema.prisma" -Destination "$schemaBackupDir\schema.prisma" -Force
    Write-Host "   ✓ Schema backup complete" -ForegroundColor Green
}

# 5. Backup Important Config Files
Write-Host ""
Write-Host "5️⃣  Backup Config Files..." -ForegroundColor Cyan
$configFiles = @(
    "package.json",
    "next.config.ts",
    "tsconfig.json",
    "middleware.ts"
)

$configBackupDir = "$mainBackupDir\config"
New-Item -ItemType Directory -Path $configBackupDir -Force | Out-Null

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$configBackupDir\$file" -Force
        Write-Host "   ✓ $file" -ForegroundColor Green
    }
}

# Summary
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ BACKUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Location: $mainBackupDir" -ForegroundColor White
Write-Host "📊 Total Size: $([math]::Round($totalSize/1MB, 2)) MB" -ForegroundColor White
Write-Host "⏱️  Duration: $([math]::Round($duration, 2)) seconds" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Copy folder backup ke external drive/USB" -ForegroundColor White
Write-Host "   - Upload ke cloud storage (Google Drive, OneDrive)" -ForegroundColor White
Write-Host "   - Lakukan backup rutin setiap minggu" -ForegroundColor White
Write-Host ""

# Buka folder backup
$openFolder = Read-Host "Buka folder backup? (y/n)"
if ($openFolder -eq "y" -or $openFolder -eq "Y") {
    Start-Process explorer.exe -ArgumentList $mainBackupDir
}

Write-Host ""
pause


