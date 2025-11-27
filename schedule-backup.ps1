# Setup Scheduled Backup - Windows Task Scheduler
# Backup otomatis database setiap hari

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Scheduled Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Script ini akan setup backup otomatis database setiap hari." -ForegroundColor Yellow
Write-Host ""

# Path ke script backup
$projectPath = "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"
$backupScript = "$projectPath\backup-database.ps1"

if (-not (Test-Path $backupScript)) {
    Write-Host "✗ Script backup-database.ps1 tidak ditemukan!" -ForegroundColor Red
    pause
    exit
}

Write-Host "Pilih waktu backup otomatis:" -ForegroundColor Cyan
Write-Host "1. Setiap hari jam 23:00 (11 PM)" -ForegroundColor White
Write-Host "2. Setiap hari jam 02:00 (2 AM)" -ForegroundColor White
Write-Host "3. Custom time" -ForegroundColor White
Write-Host "4. Cancel" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Pilihan (1-4)"

$hour = 23
$minute = 0

switch ($choice) {
    "1" { $hour = 23; $minute = 0 }
    "2" { $hour = 2; $minute = 0 }
    "3" {
        $hour = Read-Host "Jam (0-23)"
        $minute = Read-Host "Menit (0-59)"
    }
    "4" {
        Write-Host "Dibatalkan" -ForegroundColor Yellow
        pause
        exit
    }
    default {
        Write-Host "Pilihan tidak valid" -ForegroundColor Red
        pause
        exit
    }
}

# Buat Task Scheduler
$taskName = "PondokSystemBackup"
$time = "$hour`:$minute"

Write-Host ""
Write-Host "Membuat scheduled task..." -ForegroundColor Yellow
Write-Host "  Task Name: $taskName" -ForegroundColor White
Write-Host "  Time: $time setiap hari" -ForegroundColor White
Write-Host "  Script: $backupScript" -ForegroundColor White
Write-Host ""

try {
    # Hapus task lama jika ada
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "✓ Task lama dihapus" -ForegroundColor Green
    }
    
    # Buat action
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
        -Argument "-ExecutionPolicy Bypass -File `"$backupScript`"" `
        -WorkingDirectory $projectPath
    
    # Buat trigger (daily)
    $trigger = New-ScheduledTaskTrigger -Daily -At $time
    
    # Buat settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    
    # Register task
    Register-ScheduledTask -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Description "Backup database Sistem Pondok setiap hari" `
        -Force | Out-Null
    
    Write-Host ""
    Write-Host "✓ Scheduled task berhasil dibuat!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backup otomatis akan berjalan setiap hari jam $time" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Untuk mengecek/manage task:" -ForegroundColor Yellow
    Write-Host "  1. Buka 'Task Scheduler' di Windows" -ForegroundColor White
    Write-Host "  2. Cari task dengan nama: $taskName" -ForegroundColor White
    Write-Host "  3. Anda bisa run, disable, atau edit task" -ForegroundColor White
    Write-Host ""
    
    $testRun = Read-Host "Jalankan backup sekarang untuk test? (y/n)"
    if ($testRun -eq "y" -or $testRun -eq "Y") {
        Write-Host ""
        Write-Host "Running backup..." -ForegroundColor Cyan
        & $backupScript
    }
    
} catch {
    Write-Host "✗ Error saat membuat scheduled task: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Mungkin perlu run PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host ""
pause


