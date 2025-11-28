-- Migration: Add Google OAuth and User Approval System
-- Run this SQL in Supabase SQL Editor

-- Step 1: Add email and approval fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;

-- Step 2: Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Step 3: Create Account table for OAuth providers
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

-- Step 4: Create unique index on provider + providerAccountId
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" 
ON "Account"("provider", "providerAccountId");

-- Step 5: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Account_userId_fkey'
    ) THEN
        ALTER TABLE "Account" 
        ADD CONSTRAINT "Account_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Migration complete!
-- You can verify by running: SELECT column_name FROM information_schema.columns WHERE table_name = 'User';
