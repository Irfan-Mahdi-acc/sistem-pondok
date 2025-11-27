# Script Backup Environment Variables
# Backup file .env dengan enkripsi sederhana

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backup Environment Variables" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Pindah ke folder project
cd "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"

$envFile = ".env"
$backupDir = "backups\env"

# Cek apakah .env ada
if (-not (Test-Path $envFile)) {
    Write-Host "✗ File .env tidak ditemukan!" -ForegroundColor Red
    Write-Host "  Pastikan file .env ada di root project" -ForegroundColor Yellow
    pause
    exit
}

# Buat folder backup
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\.env_backup_$timestamp.txt"

try {
    # Copy .env file
    Copy-Item -Path $envFile -Destination $backupFile -Force
    
    Write-Host "✓ Backup .env berhasil!" -ForegroundColor Green
    Write-Host "  File: $backupFile" -ForegroundColor White
    Write-Host ""
    
    # Warning
    Write-Host "⚠️  PENTING:" -ForegroundColor Yellow
    Write-Host "  File ini berisi informasi sensitif (passwords, API keys)" -ForegroundColor Yellow
    Write-Host "  Jangan upload ke Git atau share ke orang lain!" -ForegroundColor Yellow
    Write-Host "  Simpan di tempat aman (USB drive, encrypted storage)" -ForegroundColor Yellow
    
    # Hitung backup
    $backupCount = (Get-ChildItem -Path $backupDir -Filter "*.txt").Count
    Write-Host ""
    Write-Host "Total backup .env: $backupCount files" -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Error saat backup: $_" -ForegroundColor Red
}

Write-Host ""
pause


