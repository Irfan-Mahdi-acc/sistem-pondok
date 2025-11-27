-- Migration: Add UserRegistration table for approval system
-- This migration should be executed via Supabase Dashboard > SQL Editor

-- Create UserRegistration table
CREATE TABLE IF NOT EXISTS "UserRegistration" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT,
  "phone" TEXT,
  "requestedRole" TEXT NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  
  -- Admin review fields
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNotes" TEXT,
  
  -- Link to created user (after approval)
  "userId" TEXT UNIQUE,
  
  -- Timestamps
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS "UserRegistration_status_idx" ON "UserRegistration"("status");

-- Create trigger to update updatedAt automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_registration_updated_at 
  BEFORE UPDATE ON "UserRegistration" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

