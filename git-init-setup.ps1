# Script untuk Initialize Git Repository
# Jalankan script ini SETELAH Git terinstall

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Git Setup untuk Sistem Web Pondok" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah Git sudah terinstall
Write-Host "Mengecek instalasi Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git terdeteksi: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git belum terinstall!" -ForegroundColor Red
    Write-Host "Silakan install Git dari: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Kemudian restart PowerShell dan jalankan script ini lagi." -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""
Write-Host "Langkah 1: Konfigurasi Git User" -ForegroundColor Yellow
$userName = Read-Host "Masukkan nama Anda (misal: Admin Pondok)"
$userEmail = Read-Host "Masukkan email Anda (misal: admin@pondok.ac.id)"

git config --global user.name "$userName"
git config --global user.email "$userEmail"
Write-Host "✓ Git user dikonfigurasi" -ForegroundColor Green

Write-Host ""
Write-Host "Langkah 2: Initialize Git Repository" -ForegroundColor Yellow
git init
Write-Host "✓ Git repository diinisialisasi" -ForegroundColor Green

Write-Host ""
Write-Host "Langkah 3: Menambahkan semua file ke staging" -ForegroundColor Yellow
git add .
Write-Host "✓ File ditambahkan ke staging area" -ForegroundColor Green

Write-Host ""
Write-Host "Langkah 4: Membuat commit pertama" -ForegroundColor Yellow
git commit -m "Initial commit: Sistem Web Pondok Tadzimussunnah - Full features"
Write-Host "✓ Initial commit berhasil dibuat!" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Git Setup Selesai!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "File yang diabaikan (tidak di-commit):" -ForegroundColor Yellow
Write-Host "  - node_modules/" -ForegroundColor Gray
Write-Host "  - .env files" -ForegroundColor Gray
Write-Host "  - prisma/*.db (database file)" -ForegroundColor Gray
Write-Host "  - public/uploads/* (uploaded files)" -ForegroundColor Gray
Write-Host "  - .next/ (build files)" -ForegroundColor Gray
Write-Host ""
Write-Host "Langkah Selanjutnya (Opsional):" -ForegroundColor Yellow
Write-Host "1. Buat repository di GitHub/GitLab" -ForegroundColor White
Write-Host "2. Link repository lokal ke remote:" -ForegroundColor White
Write-Host "   git remote add origin <URL_REPOSITORY>" -ForegroundColor Cyan
Write-Host "3. Push ke remote:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Untuk melihat status: git status" -ForegroundColor White
Write-Host "Untuk melihat history: git log --oneline" -ForegroundColor White
Write-Host ""
pause


