# Script Backup Database Otomatis
# Backup database SQLite dengan timestamp

param(
    [string]$backupDir = "backups\database"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backup Database - Sistem Pondok" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Pindah ke folder project
cd "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"

# Buat folder backup jika belum ada
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "✓ Folder backup dibuat: $backupDir" -ForegroundColor Green
}

# Database source
$dbSource = "prisma\dev.db"

if (-not (Test-Path $dbSource)) {
    Write-Host "✗ Database tidak ditemukan: $dbSource" -ForegroundColor Red
    pause
    exit
}

# Buat backup dengan timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\dev_backup_$timestamp.db"

try {
    # Copy database
    Copy-Item -Path $dbSource -Destination $backupFile -Force
    
    $fileSize = (Get-Item $backupFile).Length / 1MB
    $fileSizeFormatted = [math]::Round($fileSize, 2)
    
    Write-Host "✓ Backup berhasil!" -ForegroundColor Green
    Write-Host "  File: $backupFile" -ForegroundColor White
    Write-Host "  Size: $fileSizeFormatted MB" -ForegroundColor White
    Write-Host ""
    
    # Hitung jumlah backup yang ada
    $backupCount = (Get-ChildItem -Path $backupDir -Filter "*.db").Count
    Write-Host "Total backup: $backupCount files" -ForegroundColor Yellow
    
    # Cleanup backup lama (keep 30 terbaru)
    $maxBackups = 30
    if ($backupCount -gt $maxBackups) {
        $oldBackups = Get-ChildItem -Path $backupDir -Filter "*.db" | 
                      Sort-Object LastWriteTime | 
                      Select-Object -First ($backupCount - $maxBackups)
        
        Write-Host "Menghapus backup lama (keeping $maxBackups terbaru)..." -ForegroundColor Yellow
        foreach ($backup in $oldBackups) {
            Remove-Item $backup.FullName -Force
            Write-Host "  Dihapus: $($backup.Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Backup Complete!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Error saat backup: $_" -ForegroundColor Red
}

Write-Host ""
pause


