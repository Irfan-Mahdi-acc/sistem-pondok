# 🔧 Update Your .env File

## ✅ What You Already Have:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://lvlthftraeqqyveolzsm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bHRoZnRyYWVxcXl2ZW9senNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTg3MjMsImV4cCI6MjA3OTc5NDcyM30.arOWLoTYwSL2P-03Ht1Mf4R_OmaI9wglmNdHJhw5Bkk"
```

---

## ⏳ Still Need:

### 1. Service Role Key
**Where:** Settings → API → service_role key → Click "Reveal"
**Format:** Starts with `eyJ...` (very long)

### 2. Database URLs
**Where:** Settings → Database → Connection string

You need **2 URLs:**

**A. Session Pooling (port 6543):**
```
postgresql://postgres.lvlthftraeqqyveolzsm:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**B. URI/Direct (port 5432):**
```
postgresql://postgres.lvlthftraeqqyveolzsm:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Replace `[YOUR-PASSWORD]`** with the database password you created!

---

## 📝 Complete .env File Structure:

Open your `.env` file and add these lines:

```bash
# ===========================================
# DATABASE - Supabase PostgreSQL
# ===========================================

# Session Pooling (for Prisma Client)
DATABASE_URL="postgresql://postgres.lvlthftraeqqyveolzsm:[YOUR-DB-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for Migrations)
DIRECT_URL="postgresql://postgres.lvlthftraeqqyveolzsm:[YOUR-DB-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ===========================================
# SUPABASE API
# ===========================================

NEXT_PUBLIC_SUPABASE_URL="https://lvlthftraeqqyveolzsm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bHRoZnRyYWVxcXl2ZW9senNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTg3MjMsImV4cCI6MjA3OTc5NDcyM30.arOWLoTYwSL2P-03Ht1Mf4R_OmaI9wglmNdHJhw5Bkk"
SUPABASE_SERVICE_ROLE_KEY="[PASTE-SERVICE-ROLE-KEY-HERE]"

# ===========================================
# KEEP YOUR EXISTING VALUES
# ===========================================

NEXTAUTH_SECRET="your-existing-secret"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="your-existing-encryption-key"
```

---

## 🎯 What to Do:

1. **Get service_role key** from Settings → API
2. **Get database URLs** from Settings → Database
3. **Find your database password** (the one you saved during project creation)
4. **Replace placeholders** in the template above
5. **Keep existing** NEXTAUTH_SECRET and ENCRYPTION_KEY values
6. **Save** your `.env` file

---

## ✅ Checklist:

- [ ] DATABASE_URL filled with Session Pooling URL (port 6543)
- [ ] DIRECT_URL filled with URI URL (port 5432)
- [ ] Password replaced in both URLs
- [ ] NEXT_PUBLIC_SUPABASE_URL = https://lvlthftraeqqyveolzsm.supabase.co ✅
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY filled ✅
- [ ] SUPABASE_SERVICE_ROLE_KEY filled
- [ ] NEXTAUTH_SECRET kept from existing
- [ ] ENCRYPTION_KEY kept from existing

---

**After completing, paste here:**
1. Service role key
2. The 2 database URLs (with password)

**Then we'll proceed to schema migration!**

