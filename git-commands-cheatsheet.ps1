# Git Commands Cheatsheet - Sistem Web Pondok
# Script helper untuk command Git yang sering dipakai

param(
    [string]$action = "help"
)

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

function Show-Help {
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Git Commands Cheatsheet" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Penggunaan: .\git-commands-cheatsheet.ps1 [action]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions yang tersedia:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  status      - Cek status repository" -ForegroundColor White
    Write-Host "  log         - Lihat history commit" -ForegroundColor White
    Write-Host "  commit      - Add, commit, dan push perubahan" -ForegroundColor White
    Write-Host "  pull        - Pull perubahan dari remote" -ForegroundColor White
    Write-Host "  branch      - Lihat dan kelola branch" -ForegroundColor White
    Write-Host "  remote      - Cek remote repository" -ForegroundColor White
    Write-Host "  diff        - Lihat perubahan yang belum di-commit" -ForegroundColor White
    Write-Host "  undo        - Undo perubahan (interactive)" -ForegroundColor White
    Write-Host ""
    Write-Host "Contoh:" -ForegroundColor Yellow
    Write-Host "  .\git-commands-cheatsheet.ps1 status" -ForegroundColor Gray
    Write-Host "  .\git-commands-cheatsheet.ps1 commit" -ForegroundColor Gray
    Write-Host "  .\git-commands-cheatsheet.ps1 log" -ForegroundColor Gray
}

function Show-Status {
    Write-Host "📊 Status Repository:" -ForegroundColor Cyan
    git status
}

function Show-Log {
    Write-Host "📜 History Commit (10 terakhir):" -ForegroundColor Cyan
    git log --oneline --graph --all -10
}

function Do-Commit {
    Write-Host "💾 Commit Perubahan" -ForegroundColor Cyan
    Write-Host ""
    
    # Cek apakah ada perubahan
    $status = git status --porcelain
    if ([string]::IsNullOrEmpty($status)) {
        Write-Host "✓ Tidak ada perubahan untuk di-commit" -ForegroundColor Green
        return
    }
    
    # Tampilkan perubahan
    Write-Host "Perubahan yang akan di-commit:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    # Minta commit message
    $message = Read-Host "Masukkan commit message"
    if ([string]::IsNullOrEmpty($message)) {
        Write-Host "✗ Commit dibatalkan (message kosong)" -ForegroundColor Red
        return
    }
    
    # Add semua perubahan
    Write-Host "Adding files..." -ForegroundColor Yellow
    git add .
    
    # Commit
    Write-Host "Committing..." -ForegroundColor Yellow
    git commit -m "$message"
    
    # Tanya mau push atau tidak
    $push = Read-Host "Push ke remote? (y/n)"
    if ($push -eq "y" -or $push -eq "Y") {
        Write-Host "Pushing to remote..." -ForegroundColor Yellow
        git push origin main
        Write-Host "✓ Push berhasil!" -ForegroundColor Green
    } else {
        Write-Host "✓ Commit lokal berhasil (belum di-push)" -ForegroundColor Green
    }
}

function Do-Pull {
    Write-Host "⬇️  Pull dari Remote" -ForegroundColor Cyan
    git pull origin main
}

function Show-Branch {
    Write-Host "🌿 Branch yang Ada:" -ForegroundColor Cyan
    git branch -a
    Write-Host ""
    Write-Host "Branch aktif:" -ForegroundColor Yellow
    git branch --show-current
}

function Show-Remote {
    Write-Host "🌐 Remote Repository:" -ForegroundColor Cyan
    git remote -v
}

function Show-Diff {
    Write-Host "📝 Perubahan yang Belum Di-Commit:" -ForegroundColor Cyan
    git diff
}

function Do-Undo {
    Write-Host "↩️  Undo Perubahan" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pilih opsi:" -ForegroundColor Yellow
    Write-Host "  1. Undo semua perubahan yang belum di-commit (HATI-HATI!)" -ForegroundColor White
    Write-Host "  2. Undo commit terakhir (keep changes)" -ForegroundColor White
    Write-Host "  3. Lihat history untuk reset ke commit tertentu" -ForegroundColor White
    Write-Host "  4. Cancel" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Pilihan (1-4)"
    
    switch ($choice) {
        "1" {
            $confirm = Read-Host "YAKIN ingin undo SEMUA perubahan? (yes/no)"
            if ($confirm -eq "yes") {
                git reset --hard
                Write-Host "✓ Semua perubahan di-undo" -ForegroundColor Green
            } else {
                Write-Host "Dibatalkan" -ForegroundColor Yellow
            }
        }
        "2" {
            git reset --soft HEAD~1
            Write-Host "✓ Commit terakhir di-undo (changes masih ada)" -ForegroundColor Green
        }
        "3" {
            git log --oneline --graph -10
            Write-Host ""
            Write-Host "Untuk reset ke commit tertentu:" -ForegroundColor Yellow
            Write-Host "  git reset --soft [commit-hash]  (keep changes)" -ForegroundColor White
            Write-Host "  git reset --hard [commit-hash]  (discard changes)" -ForegroundColor White
        }
        default {
            Write-Host "Dibatalkan" -ForegroundColor Yellow
        }
    }
}

# Main script
cd "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"

switch ($action) {
    "status" { Show-Status }
    "log" { Show-Log }
    "commit" { Do-Commit }
    "pull" { Do-Pull }
    "branch" { Show-Branch }
    "remote" { Show-Remote }
    "diff" { Show-Diff }
    "undo" { Do-Undo }
    default { Show-Help }
}


