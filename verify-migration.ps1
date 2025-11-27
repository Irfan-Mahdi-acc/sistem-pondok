# Verification Script - PostgreSQL Migration
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Migration Verification" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

cd "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"

Write-Host "1. Checking .env configuration..." -ForegroundColor Yellow
if (Select-String -Path .env -Pattern "postgresql://") {
    Write-Host "   ✅ DATABASE_URL configured for PostgreSQL" -ForegroundColor Green
} else {
    Write-Host "   ❌ DATABASE_URL not configured!" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Checking Prisma schema..." -ForegroundColor Yellow
if (Select-String -Path prisma\schema.prisma -Pattern 'provider\s*=\s*"postgresql"') {
    Write-Host "   ✅ Schema configured for PostgreSQL" -ForegroundColor Green
} else {
    Write-Host "   ❌ Schema still using SQLite!" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Checking migrations..." -ForegroundColor Yellow
if (Test-Path "prisma\migrations\20251127052100_init_postgresql") {
    Write-Host "   ✅ PostgreSQL migration exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ PostgreSQL migration not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Testing database connection..." -ForegroundColor Yellow
try {
    $output = npx prisma db pull 2>&1
    if ($output -match "Introspected") {
        Write-Host "   ✅ Database connection successful" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Cannot connect to database" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Checking Supabase project..." -ForegroundColor Yellow
Write-Host "   Project: lvlthftraeqqyveolzsm" -ForegroundColor White
Write-Host "   URL: https://lvlthftraeqqyveolzsm.supabase.co" -ForegroundColor White
Write-Host "   Region: Singapore (AWS)" -ForegroundColor White

Write-Host ""
Write-Host "6. Backups preserved..." -ForegroundColor Yellow
if (Test-Path ".env.sqlite.backup") {
    Write-Host "   ✅ .env.sqlite.backup exists" -ForegroundColor Green
}
if (Test-Path "backups\database\pre-supabase-migration_2025-11-27_11-56-05.db") {
    Write-Host "   ✅ Database backup exists" -ForegroundColor Green
}
if (Test-Path "prisma\migrations.sqlite.backup") {
    Write-Host "   ✅ SQLite migrations backup exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "  2. Select project: pondok-system" -ForegroundColor White
Write-Host "  3. Click 'Table Editor' - verify tables exist" -ForegroundColor White
Write-Host "  4. Test app: http://localhost:3000" -ForegroundColor White
Write-Host "  5. Login with: irfanmahdi.dev@gmail.com" -ForegroundColor White
Write-Host ""
pause

