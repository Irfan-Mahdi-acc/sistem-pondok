# Script to update .env file for Supabase migration
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Update .env for Supabase" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Read existing .env.sqlite.backup to get secrets
$envBackup = Get-Content .env.sqlite.backup -Raw

# Extract NEXTAUTH_SECRET
if ($envBackup -match 'NEXTAUTH_SECRET="?([^"\r\n]+)"?') {
    $nextauthSecret = $matches[1]
    Write-Host "✓ Found NEXTAUTH_SECRET" -ForegroundColor Green
} else {
    Write-Host "⚠ NEXTAUTH_SECRET not found in backup" -ForegroundColor Yellow
    $nextauthSecret = "PLEASE_SET_YOUR_NEXTAUTH_SECRET_MIN_32_CHARS"
}

# Extract ENCRYPTION_KEY
if ($envBackup -match 'ENCRYPTION_KEY="?([^"\r\n]+)"?') {
    $encryptionKey = $matches[1]
    Write-Host "✓ Found ENCRYPTION_KEY" -ForegroundColor Green
} else {
    Write-Host "⚠ ENCRYPTION_KEY not found in backup" -ForegroundColor Yellow
    $encryptionKey = "PLEASE_SET_YOUR_ENCRYPTION_KEY_32_CHARS"
}

# Create new .env content
$newEnv = @"
# ===========================================
# DATABASE - Supabase PostgreSQL
# ===========================================

# Direct Connection (for Prisma Migrations)
DIRECT_URL="postgresql://postgres:Mzf_RbLg7Runiwa@db.lvlthftraeqqyveolzsm.supabase.co:5432/postgres"

# Session Pooling (for Prisma Client)
DATABASE_URL="postgresql://postgres.lvlthftraeqqyveolzsm:Mzf_RbLg7Runiwa@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# ===========================================
# SUPABASE API KEYS
# ===========================================

NEXT_PUBLIC_SUPABASE_URL="https://lvlthftraeqqyveolzsm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bHRoZnRyYWVxcXl2ZW9senNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTg3MjMsImV4cCI6MjA3OTc5NDcyM30.arOWLoTYwSL2P-03Ht1Mf4R_OmaI9wglmNdHJhw5Bkk"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bHRoZnRyYWVxcXl2ZW9senNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDIxODcyMywiZXhwIjoyMDc5Nzk0NzIzfQ.nxEPpNP-_AKohDpsAjmPtoKBw8wwnF95fw_PFxq3sj0"

# ===========================================
# AUTHENTICATION - NextAuth
# ===========================================

NEXTAUTH_SECRET="$nextauthSecret"
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# ENCRYPTION (for sensitive data)
# ===========================================

ENCRYPTION_KEY="$encryptionKey"

# ===========================================
# OPTIONAL: Security Settings
# ===========================================

MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30
"@

# Write new .env
$newEnv | Out-File -FilePath .env -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Database: PostgreSQL (Supabase)" -ForegroundColor White
Write-Host "  Project: lvlthftraeqqyveolzsm" -ForegroundColor White
Write-Host "  Region: Singapore" -ForegroundColor White
Write-Host ""

if ($nextauthSecret -eq "PLEASE_SET_YOUR_NEXTAUTH_SECRET_MIN_32_CHARS") {
    Write-Host "⚠ WARNING: NEXTAUTH_SECRET not set!" -ForegroundColor Yellow
    Write-Host "  Please edit .env and set NEXTAUTH_SECRET manually" -ForegroundColor Yellow
}

if ($encryptionKey -eq "PLEASE_SET_YOUR_ENCRYPTION_KEY_32_CHARS") {
    Write-Host "⚠ WARNING: ENCRYPTION_KEY not set!" -ForegroundColor Yellow
    Write-Host "  Please edit .env and set ENCRYPTION_KEY manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next step: Run 'npx prisma generate'" -ForegroundColor Cyan
Write-Host ""

