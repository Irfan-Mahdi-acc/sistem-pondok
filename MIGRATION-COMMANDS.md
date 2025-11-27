# 🚀 Migration Commands - Execute These Steps

## ✅ What We've Done:

1. ✅ Updated `prisma/schema.prisma`:
   - Changed provider: "sqlite" → "postgresql"
   - Added `directUrl` for migrations
   - Changed `roles` field: String → Json (PostgreSQL native type)

2. ✅ Created complete .env configuration in `COMPLETE-ENV-FILE.txt`

---

## 📋 STEP-BY-STEP EXECUTION:

### **Step 1: Update Your .env File** (2 minutes)

**ACTION REQUIRED:**

1. **BACKUP your current .env file first!**
   ```powershell
   Copy-Item .env .env.sqlite.backup
   ```

2. **Open `COMPLETE-ENV-FILE.txt`**

3. **Copy your existing values:**
   - Open your current `.env` file
   - Find and copy:
     - `NEXTAUTH_SECRET=...`
     - `ENCRYPTION_KEY=...`

4. **Update `COMPLETE-ENV-FILE.txt`:**
   - Replace `your-existing-nextauth-secret-min-32-chars` with your actual NEXTAUTH_SECRET
   - Replace `your-existing-encryption-key-32-chars` with your actual ENCRYPTION_KEY

5. **Save as `.env`:**
   - Copy entire content from `COMPLETE-ENV-FILE.txt`
   - Paste into your `.env` file
   - Save

**✅ Done? Check:**
```powershell
# Verify .env has DATABASE_URL starting with postgresql://
# (Don't run this, just check manually)
```

---

### **Step 2: Generate Prisma Client** (30 seconds)

```powershell
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client
```

---

### **Step 3: Test Database Connection** (30 seconds)

```powershell
npx prisma db pull
```

**Expected output:**
```
✔ Introspected 0 models and wrote them into prisma/schema.prisma
```

**Note:** It's OK if it says 0 models - database is empty and ready!

---

### **Step 4: Create Migration** (1 minute)

```powershell
npx prisma migrate dev --name migrate_to_postgresql
```

**What this does:**
- Creates all tables in Supabase PostgreSQL
- Applies your schema
- Generates Prisma Client

**Expected output:**
```
The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251127XXXXXX_migrate_to_postgresql/
    └─ migration.sql

✔ Generated Prisma Client
```

**⚠️ If you get errors:** Copy the error message and tell me!

---

### **Step 5: Verify in Supabase Dashboard** (1 minute)

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `pondok-system`
3. Click **"Table Editor"** in left sidebar
4. **You should see ALL your tables created!**
   - User
   - Santri
   - Lembaga
   - Kelas
   - Nilai
   - etc. (30+ tables)

**✅ Success if you see all tables!**

---

### **Step 6: Test Application** (2 minutes)

```powershell
npm run dev
```

**Then:**
1. Open http://localhost:3000
2. Try to login
3. Check if dashboard loads
4. Try basic operations

**✅ If everything works → Migration SUCCESS! 🎉**

---

## 🆘 Common Issues & Solutions:

### Issue 1: "Can't reach database server"

**Solution:**
- Check `DATABASE_URL` and `DIRECT_URL` in `.env` are correct
- Verify no extra spaces
- Make sure password is correct: `Mzf_RbLg7Runiwa`

### Issue 2: "Column type changed"

**Solution:**
```powershell
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name migrate_to_postgresql
```

### Issue 3: "Authentication failed"

**Solution:**
- Check database password in URLs
- Try resetting database password in Supabase Settings → Database

### Issue 4: Prisma Client errors

**Solution:**
```powershell
# Regenerate client
npx prisma generate
# Restart dev server
npm run dev
```

---

## 🔄 Rollback Plan (If Needed)

**If something goes wrong:**

```powershell
# 1. Stop dev server (Ctrl+C)

# 2. Restore SQLite .env
Copy-Item .env.sqlite.backup .env -Force

# 3. Update schema.prisma datasource to:
# provider = "sqlite"
# url = env("DATABASE_URL")
# (remove directUrl line)

# 4. Restore database
Copy-Item "backups\database\pre-supabase-migration_2025-11-27_11-56-05.db" -Destination "prisma\dev.db" -Force

# 5. Regenerate
npx prisma generate

# 6. Restart
npm run dev
```

---

## 📊 Migration Checklist:

- [ ] Step 1: .env updated with all values ✅
- [ ] Step 2: `npx prisma generate` ✅
- [ ] Step 3: `npx prisma db pull` ✅
- [ ] Step 4: `npx prisma migrate dev` ✅
- [ ] Step 5: Tables visible in Supabase ✅
- [ ] Step 6: App running & working ✅

---

## 🎯 After Migration Success:

### Update MIGRATION-PROGRESS.md:
- Mark all phases as complete
- Note completion date
- Document any issues encountered

### Next Steps:
1. Test all features thoroughly
2. Add more indexes for performance (optional)
3. Setup Supabase Storage for file uploads (optional)
4. Implement Row Level Security (advanced)
5. Continue development with PostgreSQL! 🚀

---

## 💡 Tips:

- Keep SQLite backup for at least 1 week
- Test thoroughly before adding real data
- Supabase Dashboard is great for viewing data
- PostgreSQL is much faster than SQLite!

---

**Ready? Start with Step 1! Good luck! 💪**

