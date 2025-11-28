# Manual Migration Instructions for Vercel

## Problem
Prisma migrations require direct database connection (port 5432) which is not accessible from Vercel build environment.

## Solution
Run migration manually after deployment using Vercel CLI or from local machine connected to production database.

## Steps

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI if not already installed:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link to your project:
```bash
vercel link
```

4. Run migration using production environment variables:
```bash
vercel env pull .env.production
DATABASE_URL="your-direct-url-here" npx prisma migrate deploy
```

### Option 2: From Local Machine

1. Temporarily update your `.env.local` with production `DIRECT_URL`:
```env
DATABASE_URL="postgresql://postgres.xxx:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:5432/postgres"
```

2. Run migration:
```bash
npx prisma migrate deploy
```

3. Revert `.env.local` back to development settings

### Option 3: Using Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration SQL manually:

```sql
-- From: prisma/migrations/20251128140000_add_google_oauth_and_approval/migration.sql

-- AlterTable User - Add email and approval fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateTable Account for OAuth
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Account_userId_fkey'
    ) THEN
        ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
```

3. Mark migration as applied in Prisma:
```bash
npx prisma migrate resolve --applied 20251128140000_add_google_oauth_and_approval
```

## After Migration

Once migration is complete, the application will work correctly with:
- Google OAuth login/signup
- User approval system
- Email verification

## Verification

Check if migration was successful:
```bash
npx prisma migrate status
```

Should show: "Database schema is up to date!"
