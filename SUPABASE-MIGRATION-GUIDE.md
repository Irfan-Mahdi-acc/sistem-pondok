# 🚀 Supabase Migration Guide
## Sistem Web Pondok Tadzimussunnah

> **From:** SQLite + NextAuth  
> **To:** PostgreSQL (Supabase) + Supabase Auth (optional)  
> **Timeline:** 1-2 weeks  
> **Risk Level:** Medium (manageable)

---

## 📊 Overview

### Why Migrate to Supabase?

**Benefits:**
- ✅ PostgreSQL (production-grade database)
- ✅ Built-in Authentication (alternative to NextAuth)
- ✅ Real-time subscriptions
- ✅ Cloud storage (for file uploads)
- ✅ Auto-generated REST API
- ✅ Row Level Security (RLS)
- ✅ Automatic backups
- ✅ Better scalability

**Considerations:**
- ⚠️ Need internet for development
- ⚠️ Learning curve (1 week)
- ⚠️ Cost after free tier ($25/month)

---

## 🎯 Migration Strategy

### Option A: Keep NextAuth (Recommended for Minimal Change)
```
✅ Easier migration
✅ Keep current authentication flow
✅ Less code changes
⚠️ Manage two systems (NextAuth + Supabase)
```

### Option B: Switch to Supabase Auth (Future-proof)
```
✅ Unified Supabase ecosystem
✅ Built-in features (email verification, OAuth)
✅ Row Level Security integration
⚠️ More code changes required
⚠️ Need to rebuild auth flows
```

**My Recommendation:** Start with Option A, migrate to Option B later if needed.

---

## 📅 Week-by-Week Plan

### **Week 1: Preparation & Setup**

#### Day 1: Pre-Migration Tasks
```bash
# 1. Backup everything
git add .
git commit -m "Pre-migration backup"
git push origin main

# 2. Backup database
cp prisma/dev.db backups/pre-supabase-migration-$(date +%Y%m%d).db

# 3. Export schema
npx prisma db pull > schema-backup.prisma

# 4. Document current system
```

#### Day 2: Supabase Setup
1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free tier)
   - Create new project: "pondok-system"
   - Choose region (Singapore for Indonesia)
   - Wait for project to initialize (~2 minutes)

2. **Get Connection Details**
   ```
   Project Settings → Database → Connection String
   
   Copy these:
   - Database URL (for Prisma)
   - Direct URL (for migrations)
   - API URL
   - anon/service_role keys
   ```

3. **Update Environment Variables**
   ```bash
   # .env (add these, keep old SQLite for now)
   
   # Supabase PostgreSQL
   DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   
   # Supabase API (for future use)
   NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
   SUPABASE_SERVICE_ROLE_KEY="[your-service-key]"
   
   # Keep NextAuth for now
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="..."
   ```

#### Day 3: Schema Migration

**Update Prisma Schema:**
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"  // Changed from sqlite
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Update models for PostgreSQL compatibility

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  name      String
  
  // PostgreSQL uses Json instead of String for JSON data
  roles     Json     @default("[]")  // Changed from String
  
  avatarUrl String?
  
  // Security fields
  passwordChangedAt    DateTime?
  failedLoginAttempts  Int       @default(0)
  lockedUntil          DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations remain the same
  ustadzProfile   UstadzProfile?
  santriProfile   Santri?
  permissions     UserPermission[]
  financialAccess FinancialCategoryAccess[]
}

// Update other models similarly...
// Key changes for PostgreSQL:
// 1. Json type instead of String for JSON fields
// 2. Some field types might need adjustment
// 3. Indexes work better in PostgreSQL
```

**Key Schema Changes for PostgreSQL:**

1. **JSON Fields:**
   ```prisma
   // SQLite
   roles String @default("[]")
   
   // PostgreSQL
   roles Json @default("[]")
   ```

2. **Full-Text Search (if needed):**
   ```prisma
   // Add indexes for search
   @@index([fullName], type: Gin) // PostgreSQL GIN index
   ```

3. **Better Indexes:**
   ```prisma
   model Santri {
     @@index([kelasId])
     @@index([lembagaId])
     @@index([fullName])
     @@index([nisn])
     @@index([status])
     @@index([createdAt])
   }
   ```

**Generate Migration:**
```bash
# Create new migration for PostgreSQL
npx prisma migrate dev --name migrate_to_postgresql

# This will:
# 1. Generate SQL migration files
# 2. Apply to Supabase database
# 3. Generate Prisma Client
```

#### Day 4: Code Adjustments

**Update Prisma Client Usage:**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Update Actions with JSON Handling:**

```typescript
// Before (SQLite with String)
const user = await prisma.user.findUnique({ where: { id } })
const roles = JSON.parse(user.roles || '[]')

// After (PostgreSQL with Json type)
const user = await prisma.user.findUnique({ where: { id } })
const roles = user.roles as string[]  // No need to parse!

// When creating/updating:
await prisma.user.create({
  data: {
    username: "test",
    roles: ["ADMIN", "USTADZ"]  // Direct array, Prisma handles JSON
  }
})
```

**Search Operations (Better with PostgreSQL):**

```typescript
// Before (SQLite - case sensitive)
const santri = await prisma.santri.findMany({
  where: {
    fullName: { contains: search }
  }
})

// After (PostgreSQL - case insensitive)
const santri = await prisma.santri.findMany({
  where: {
    fullName: { 
      contains: search,
      mode: 'insensitive'  // PostgreSQL supports this!
    }
  }
})
```

#### Day 5-7: Testing & Data Migration

**1. Test New Connection:**
```bash
# Test Prisma can connect
npx prisma db pull

# Test queries
npm run dev

# Try basic operations:
# - Create user
# - Login
# - CRUD operations
```

**2. Migrate Existing Data (if any):**

```typescript
// scripts/migrate-data-to-supabase.ts
import { PrismaClient as SQLitePrisma } from '@prisma/client'
import { PrismaClient as PostgresPrisma } from '@prisma/client'

async function migrateData() {
  // Connect to both databases
  const sqlite = new SQLitePrisma({
    datasources: {
      db: {
        url: 'file:./prisma/dev.db.backup'
      }
    }
  })
  
  const postgres = new PostgresPrisma()
  
  console.log('Starting migration...')
  
  try {
    // 1. Migrate Users (ORDER MATTERS - dependencies)
    console.log('Migrating users...')
    const users = await sqlite.user.findMany()
    for (const user of users) {
      await postgres.user.create({
        data: {
          ...user,
          roles: JSON.parse(user.roles) // Convert String to Json
        }
      })
    }
    console.log(`✓ Migrated ${users.length} users`)
    
    // 2. Migrate Lembagas
    console.log('Migrating lembagas...')
    const lembagas = await sqlite.lembaga.findMany()
    await postgres.lembaga.createMany({
      data: lembagas
    })
    console.log(`✓ Migrated ${lembagas.length} lembagas`)
    
    // 3. Migrate Kelas
    console.log('Migrating kelas...')
    const kelasList = await sqlite.kelas.findMany()
    await postgres.kelas.createMany({
      data: kelasList
    })
    console.log(`✓ Migrated ${kelasList.length} kelas`)
    
    // 4. Migrate Santri
    console.log('Migrating santri...')
    const santriList = await sqlite.santri.findMany()
    await postgres.santri.createMany({
      data: santriList
    })
    console.log(`✓ Migrated ${santriList.length} santri`)
    
    // 5. Migrate other tables in dependency order...
    // - UstadzProfile
    // - Nilai
    // - Ujian
    // - etc.
    
    console.log('\n✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

// Run migration
migrateData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
```

**Run Migration:**
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-data-to-supabase.ts
```

**3. Verification:**
```bash
# Check data in Supabase Dashboard
# Table Editor → View all tables

# Or via Prisma Studio
npx prisma studio
```

---

### **Week 2: Optimization & Features**

#### Day 1-2: Performance Optimization

**1. Add PostgreSQL-Specific Indexes:**
```prisma
model Santri {
  // Existing fields...
  
  // B-tree indexes (default, good for equality & range)
  @@index([kelasId])
  @@index([lembagaId])
  @@index([status])
  @@index([createdAt])
  
  // GIN index for full-text search (PostgreSQL-specific)
  // Requires extension: CREATE EXTENSION pg_trgm;
  @@index([fullName], type: Gin, ops: GinTrgmOps)
  
  // Composite indexes for common queries
  @@index([lembagaId, kelasId])
  @@index([kelasId, status])
}
```

**Enable Extensions in Supabase:**
```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For UUID generation
```

**2. Implement Connection Pooling:**

Supabase provides connection pooling by default, but optimize:

```typescript
// For serverless environments (Vercel, etc.)
// Use connection pooling URL (port 6543 instead of 5432)
// Already configured in DIRECT_URL
```

#### Day 3-4: Supabase Storage (Optional but Recommended)

**Setup for File Uploads:**

```bash
npm install @supabase/supabase-js
```

**Create Storage Utility:**
```typescript
// src/lib/supabase-storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key for server-side
)

export async function uploadToSupabase(
  file: File,
  bucket: string,
  path: string
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

export async function deleteFromSupabase(
  bucket: string,
  path: string
) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  return { success: !error }
}
```

**Create Storage Buckets in Supabase:**
1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - `avatars` (public)
   - `documents` (public/private as needed)
   - `santri-photos` (public)

**Update Upload Actions:**
```typescript
// src/actions/upload-actions.ts
"use server"

import { uploadToSupabase } from '@/lib/supabase-storage'

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File
    
    // Validation
    if (!file) throw new Error('No file provided')
    if (file.size > 5 * 1024 * 1024) throw new Error('File too large')
    
    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36)}.${ext}`
    
    // Upload to Supabase
    const result = await uploadToSupabase(
      file,
      'avatars',
      filename
    )
    
    if (!result.success) throw new Error(result.error)
    
    return {
      success: true,
      url: result.url
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

#### Day 5-7: Row Level Security (RLS) Setup

**Why RLS?**
- Security at database level
- Users can only access their own data
- Works with Supabase Auth integration

**Enable RLS:**
```sql
-- Run in Supabase SQL Editor

-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Santri" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Nilai" ENABLE ROW LEVEL SECURITY;

-- Create policies (example for Santri)
CREATE POLICY "Users can view santri in their lembaga"
  ON "Santri"
  FOR SELECT
  USING (
    "lembagaId" IN (
      SELECT "id" FROM "Lembaga"
      WHERE "id" IN (
        -- Logic to check user's lembaga access
        SELECT unnest(string_to_array(current_setting('request.jwt.claims', true)::json->>'lembagas', ','))
      )
    )
  );

-- More policies as needed...
```

**Note:** RLS is advanced. Start without it, implement later when needed.

---

## 🔄 Rollback Plan (If Something Goes Wrong)

### Quick Rollback to SQLite:

```bash
# 1. Switch back to SQLite in .env
DATABASE_URL="file:./dev.db"

# 2. Restore backup
cp backups/pre-supabase-migration-*.db prisma/dev.db

# 3. Update schema.prisma
# Change provider back to "sqlite"

# 4. Regenerate client
npx prisma generate

# 5. Restart dev server
npm run dev
```

---

## ✅ Post-Migration Checklist

### Week 2-3: Verification & Testing

- [ ] All features working with PostgreSQL
- [ ] Performance testing (should be faster!)
- [ ] Load testing with larger datasets
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Documentation updated
- [ ] Team trained on new setup

### Testing Checklist:

```
User Management:
- [ ] Login/Logout works
- [ ] User creation
- [ ] Role assignment
- [ ] Profile updates

Santri Management:
- [ ] List/View santri
- [ ] Create new santri
- [ ] Edit santri
- [ ] Delete santri
- [ ] Search/Filter santri

Nilai Management:
- [ ] Input nilai
- [ ] View rapor
- [ ] Export rapor
- [ ] Grade calculations

File Uploads:
- [ ] Avatar upload
- [ ] Document upload
- [ ] Image display
- [ ] File deletion

Performance:
- [ ] Page load times < 1s
- [ ] Query times < 100ms
- [ ] No N+1 queries
- [ ] Pagination works
```

---

## 🎓 Learning Resources

### Supabase Docs:
- **Getting Started:** https://supabase.com/docs/guides/getting-started
- **Database:** https://supabase.com/docs/guides/database
- **Auth:** https://supabase.com/docs/guides/auth
- **Storage:** https://supabase.com/docs/guides/storage

### PostgreSQL:
- **Prisma + PostgreSQL:** https://www.prisma.io/docs/concepts/database-connectors/postgresql
- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/

### Video Tutorials:
- **Supabase Crash Course:** Search on YouTube
- **Next.js + Supabase:** Many tutorials available

---

## 💰 Cost Considerations

### Supabase Pricing:

**Free Tier (Good for Development):**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth
- 1-day log retention

**Pro Tier ($25/month - Recommended for Production):**
- 8GB database
- 100GB storage  
- Unlimited users
- 50GB bandwidth
- 7-day log retention
- Daily backups
- Support

**Enterprise:** Custom pricing

**Recommendation:**
- Start with Free tier
- Upgrade when needed (probably after 6-12 months)

---

## 🚀 Next Steps After Migration

1. **Week 3: Implement Improvements**
   - Pagination (now easier with PostgreSQL)
   - Full-text search (PostgreSQL ftw!)
   - Advanced filtering
   - Real-time updates (optional)

2. **Week 4: New Features**
   - Build with confidence
   - Better performance
   - Scalable architecture

3. **Production Deployment**
   - Deploy to Vercel/Railway
   - Configure production Supabase
   - Setup monitoring
   - Go live! 🎉

---

## ⚠️ Common Pitfalls & Solutions

### 1. JSON Field Issues
```typescript
// ❌ Wrong
roles: JSON.stringify(['ADMIN'])

// ✅ Correct with PostgreSQL Json type
roles: ['ADMIN']
```

### 2. Case Sensitivity
```typescript
// SQLite: case-insensitive by default
// PostgreSQL: case-sensitive by default

// Solution: Use mode: 'insensitive'
where: {
  fullName: { 
    contains: search,
    mode: 'insensitive'
  }
}
```

### 3. Connection Issues
```
Error: Can't reach database server

Solutions:
- Check DATABASE_URL is correct
- Verify Supabase project is active
- Check network/firewall
- Use DIRECT_URL for migrations
```

### 4. Migration Errors
```
Error: relation "User" already exists

Solution:
- Drop and recreate (development only!)
- Or use prisma migrate reset
```

---

## 🎯 Success Criteria

✅ **Migration Successful When:**

1. All features work with PostgreSQL
2. Performance is same or better
3. No data loss
4. Tests passing
5. Team comfortable with new setup
6. Documentation updated
7. Ready for continued development

---

## 📞 Support

**If Stuck:**
1. Supabase Discord: https://discord.supabase.com
2. Prisma Discord: https://discord.gg/prisma
3. Stack Overflow
4. GitHub Discussions

---

**Migration Date:** [Fill in when you start]  
**Completed Date:** [Fill in when done]  
**Status:** 🚀 Ready to migrate!

---

**Let's build on a solid foundation! 💪**

