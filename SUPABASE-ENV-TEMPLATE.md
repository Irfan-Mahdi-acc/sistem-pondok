# 🔐 Supabase Environment Variables Template

Copy these to your `.env` file after creating Supabase project.

---

## 📋 Required Environment Variables

```bash
# ===================================
# DATABASE (Supabase PostgreSQL)
# ===================================

# Session Pooling (for Prisma Client)
# Get from: Settings → Database → Connection String → Session Pooling
DATABASE_URL="postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for Migrations)
# Get from: Settings → Database → Connection String → URI
DIRECT_URL="postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ===================================
# SUPABASE API
# ===================================

# Get from: Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# ===================================
# KEEP EXISTING (NextAuth)
# ===================================

NEXTAUTH_SECRET="your-existing-secret"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="your-existing-encryption-key"
```

---

## 🔍 Where to Find These Values

### 1. Database URLs
1. Go to Supabase Dashboard
2. Click **Settings** (gear icon)
3. Click **Database**
4. Scroll to **Connection String** section
5. Toggle **Display connection pooling string**
6. Copy both URLs:
   - **Session mode** (port 6543) → DATABASE_URL
   - **URI** (port 5432) → DIRECT_URL

### 2. API Keys
1. Go to Supabase Dashboard
2. Click **Settings** (gear icon)
3. Click **API**
4. Copy:
   - **Project URL** → NEXT_PUBLIC_SUPABASE_URL
   - **anon public** key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **service_role** key → SUPABASE_SERVICE_ROLE_KEY

---

## ⚠️ IMPORTANT NOTES

1. **NEVER commit `.env` to Git**
2. **Save database password securely** - you'll need it
3. **Keep SQLite backup** for rollback
4. **Test in development** before production
5. **Replace `[PROJECT-REF]`** with your actual project reference
6. **Replace `[YOUR-PASSWORD]`** with database password you created

---

## ✅ Quick Checklist

After adding to `.env`:
- [ ] DATABASE_URL filled in
- [ ] DIRECT_URL filled in
- [ ] NEXT_PUBLIC_SUPABASE_URL filled in
- [ ] API keys filled in
- [ ] Kept existing NEXTAUTH_SECRET
- [ ] Kept existing ENCRYPTION_KEY
- [ ] Tested connection: `npx prisma db pull`

---

## 🔄 Rollback (if needed)

Keep old SQLite config commented in `.env`:
```bash
# SQLite (for rollback)
# DATABASE_URL="file:./dev.db"
```

Can easily switch back if needed!

---

**Next:** Update `prisma/schema.prisma` to use PostgreSQL

