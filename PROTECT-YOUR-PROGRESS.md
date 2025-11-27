# 🛡️ Panduan Lengkap: Melindungi Progress Anda

## 📋 Daftar Isi
1. [Layer Proteksi](#layer-proteksi)
2. [Setup Awal](#setup-awal)
3. [Rutinitas Harian](#rutinitas-harian)
4. [Rutinitas Mingguan](#rutinitas-mingguan)
5. [Best Practices](#best-practices)
6. [Quick Commands](#quick-commands)

---

## 🎯 Layer Proteksi

### ✅ Layer 1: Git Version Control (SUDAH AKTIF!)
**Status:** ✅ Terinstall & Configured  
**Proteksi:** Source code & configuration files  
**Benefit:** History lengkap, rollback mudah

### 🔄 Layer 2: Database & Files Backup
**Status:** ⚠️ Perlu setup  
**Proteksi:** Data santri, nilai, keuangan, uploads  
**Benefit:** Disaster recovery, data loss prevention

### ☁️ Layer 3: Cloud Backup
**Status:** 📝 Optional tapi RECOMMENDED  
**Proteksi:** Full disaster recovery  
**Benefit:** Aman meski laptop rusak/hilang

---

## 🚀 Setup Awal (Lakukan Sekali Saja)

### Step 1: Test Backup Database ✅
```powershell
# Jalankan script ini untuk test
.\backup-database.ps1
```
✅ **Sukses jika:** Folder `backups/database/` terbuat dengan file .db

---

### Step 2: Setup Backup Otomatis ⭐ PENTING
```powershell
# Setup backup database otomatis setiap hari
.\schedule-backup.ps1
```
**Pilih jam:** 23:00 (recommended)  
✅ **Sukses jika:** Windows Task Scheduler terbuat

**Verify:**
1. Buka "Task Scheduler" di Windows
2. Cari task "PondokSystemBackup"
3. Seharusnya status: Ready

---

### Step 3: Backup Environment Variables
```powershell
# Backup .env file (berisi password)
.\backup-env.ps1
```
✅ **Sukses jika:** File backup di `backups/env/`

---

### Step 4: Setup GitHub (Cloud Backup) ⭐⭐ SANGAT RECOMMENDED

**Baca panduan lengkap:** `GITHUB-SETUP-GUIDE.md`

**Quick steps:**
1. Buat akun di https://github.com
2. Buat repository **private**
3. Link repository:
```powershell
git remote add origin https://github.com/[USERNAME]/sistem-web-pondok.git
git push -u origin main
```

✅ **Sukses jika:** Code Anda visible di GitHub website

---

## 📅 Rutinitas Harian

### Morning Routine (Sebelum Coding):
```powershell
# 1. Pull perubahan (jika ada remote)
git pull origin main

# 2. Cek status
git status
```

---

### Evening Routine (Setelah Coding):

#### Jika ada perubahan code:
```powershell
# 1. Cek perubahan apa saja
git status

# 2. Commit perubahan
git add .
git commit -m "Deskripsi apa yang diubah hari ini"

# 3. Push ke GitHub (jika sudah setup)
git push origin main
```

**Atau pakai helper script:**
```powershell
.\git-commands-cheatsheet.ps1 commit
```

#### Backup Database Manual (Optional - sudah ada auto):
```powershell
# Jika mau backup sekarang
.\backup-database.ps1
```

---

## 📆 Rutinitas Mingguan (Setiap Jumat)

### 1. Backup Lengkap:
```powershell
.\backup-all.ps1
```
Ini akan backup:
- ✅ Database
- ✅ Environment variables
- ✅ Config files
- ✅ Uploads (jika tidak terlalu besar)

---

### 2. Verify Backups:
```powershell
# Cek berapa backup database yang ada
dir backups\database

# Cek scheduled task masih jalan
Get-ScheduledTask -TaskName "PondokSystemBackup"
```

---

### 3. Push ke GitHub:
```powershell
# Pastikan semua perubahan minggu ini sudah di-push
git status
git push origin main
```

---

### 4. Copy Backup ke External Drive (Bulanan):

**Setiap akhir bulan:**
```powershell
# Copy folder backup ke USB/External Drive
$month = Get-Date -Format "yyyy-MM"
Copy-Item -Path "backups" -Destination "E:\PondokBackup\$month" -Recurse
```

---

## 🎯 Best Practices

### ✅ DO (Lakukan):

1. **Commit Sering**
   - Setelah selesai 1 fitur
   - Sebelum pulang
   - Minimal 1x per hari

2. **Commit Message yang Jelas**
   ```powershell
   ✅ BAIK:
   git commit -m "Tambah fitur input nilai ujian"
   git commit -m "Fix bug pada kalkulasi rapor"
   git commit -m "Update tampilan dashboard"
   
   ❌ KURANG BAIK:
   git commit -m "update"
   git commit -m "fix"
   git commit -m "changes"
   ```

3. **Cek Backup Rutin**
   - Pastikan scheduled task jalan
   - Verify backup file exist

4. **Test Restore (Sebulan Sekali)**
   - Test restore database dari backup
   - Pastikan backup file tidak corrupt

5. **Push ke GitHub Rutin**
   - Minimal seminggu sekali
   - Setelah perubahan besar

---

### ❌ DON'T (Jangan):

1. **Jangan Commit File Sensitif**
   - ❌ `.env` (password, API keys)
   - ❌ `prisma/*.db` (database)
   - ❌ `public/uploads/*` (user files)
   - ✅ Sudah di-handle oleh .gitignore

2. **Jangan Lupa Backup Manual**
   - Database perlu backup terpisah dari Git
   - .env perlu backup aman

3. **Jangan Force Push**
   ```powershell
   ❌ JANGAN: git push --force
   ✅ GUNAKAN: git push
   ```

4. **Jangan Ignore Backup Errors**
   - Jika backup fail, investigate kenapa
   - Jangan biarkan backup corrupt

---

## ⚡ Quick Commands Reference

### Git Commands:

| Task | Command |
|------|---------|
| Cek status | `git status` |
| Commit changes | `git add . && git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Pull updates | `git pull origin main` |
| View history | `git log --oneline` |
| Undo changes | `git reset --hard` |
| Create branch | `git checkout -b feature-name` |

---

### Backup Commands:

| Task | Command |
|------|---------|
| Backup database | `.\backup-database.ps1` |
| Backup .env | `.\backup-env.ps1` |
| Backup lengkap | `.\backup-all.ps1` |
| Setup auto backup | `.\schedule-backup.ps1` |
| Check backups | `dir backups\database` |

---

### Helper Scripts:

| Task | Command |
|------|---------|
| Git status | `.\git-commands-cheatsheet.ps1 status` |
| Git commit (interactive) | `.\git-commands-cheatsheet.ps1 commit` |
| Git log | `.\git-commands-cheatsheet.ps1 log` |
| Undo changes | `.\git-commands-cheatsheet.ps1 undo` |

---

## 🔄 Recovery Procedures

### Restore Database:
```powershell
# 1. List available backups
dir backups\database | Sort-Object LastWriteTime

# 2. Copy backup ke database
Copy-Item "backups\database\dev_backup_[DATE].db" -Destination "prisma\dev.db" -Force

# 3. Restart server
```

---

### Restore Code (Git):
```powershell
# Reset ke commit tertentu
git log --oneline
git reset --hard [commit-hash]

# Atau reset ke commit terakhir
git reset --hard HEAD
```

---

### Restore dari GitHub (Laptop Baru):
```powershell
# 1. Clone repository
git clone https://github.com/[USERNAME]/sistem-web-pondok.git

# 2. Install dependencies
cd sistem-web-pondok
npm install

# 3. Setup .env (manual)
# 4. Restore database (manual)
# 5. Run
npm run dev
```

---

## 📊 Monitoring & Maintenance

### Weekly Check (5 menit):

```powershell
# 1. Cek berapa backup database
(Get-ChildItem "backups\database").Count

# 2. Cek scheduled task
Get-ScheduledTask -TaskName "PondokSystemBackup"

# 3. Cek Git status
git status

# 4. Cek disk space
Get-PSDrive D | Select-Object Used, Free
```

---

### Monthly Check (15 menit):

1. ✅ Test restore database
2. ✅ Verify GitHub backup
3. ✅ Copy backup ke external drive
4. ✅ Review & cleanup old backups (>60 hari)
5. ✅ Update dokumentasi jika ada perubahan

---

## 🎁 Bonus: Workflow untuk Fitur Baru

### Cara Aman Develop Fitur Baru:

```powershell
# 1. Backup dulu (safety net)
.\backup-all.ps1

# 2. Buat branch baru
git checkout -b fitur-[nama-fitur]

# 3. Develop fitur Anda
# ... coding ...

# 4. Test fitur

# 5. Commit di branch
git add .
git commit -m "Selesai fitur [nama]"

# 6. Merge ke main (jika sukses)
git checkout main
git merge fitur-[nama-fitur]

# 7. Push
git push origin main

# 8. Delete branch (optional)
git branch -d fitur-[nama-fitur]
```

**Benefit:** Jika fitur gagal, main branch tetap aman!

---

## ✅ Checklist Proteksi Progress

### Initial Setup:
- [x] Git terinstall ✅
- [x] Repository initialized ✅
- [x] Initial commit created ✅
- [ ] Backup database tested
- [ ] Scheduled backup setup
- [ ] GitHub remote configured
- [ ] First push to GitHub
- [ ] .env backed up
- [ ] External drive backup

### Daily:
- [ ] Git commit (jika ada perubahan)
- [ ] Git push (jika ada commit baru)
- [ ] Verify scheduled backup jalan

### Weekly:
- [ ] Full backup (`.\backup-all.ps1`)
- [ ] Verify backups exist
- [ ] Push to GitHub
- [ ] Review commit history

### Monthly:
- [ ] Test restore database
- [ ] Copy backup to external drive
- [ ] Cleanup old backups
- [ ] Verify cloud storage

---

## 🆘 Emergency Contacts & Resources

### Documentation:
- 📄 `GIT-WORKFLOW.md` - Git daily workflow
- 📄 `GITHUB-SETUP-GUIDE.md` - Cloud backup setup
- 📄 `BACKUP-STRATEGY.md` - Detailed backup strategy
- 📄 `GIT-SETUP-SUMMARY.md` - Current setup status

### External Resources:
- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Git Tutorial: https://try.github.io

---

## 🎯 Success Metrics

**Your progress is SAFE when:**

✅ Git commits at least 1x per day  
✅ GitHub push at least 1x per week  
✅ Database backup every day (automated)  
✅ Full backup every week  
✅ External drive backup every month  
✅ Tested restore procedures  

**Current Status:**
- ✅ Git: ACTIVE
- ⚠️ Automated backup: NEEDS SETUP
- ⚠️ GitHub: NEEDS SETUP
- ⚠️ External backup: NEEDS SETUP

---

## 🎉 Kesimpulan

Dengan mengikuti panduan ini, progress Anda akan:

🛡️ **Terlindungi dari:**
- Hardware failure
- Human error
- Software bugs
- Accidental deletion
- Ransomware

💪 **Memiliki kemampuan:**
- Rollback ke versi sebelumnya
- Restore data dalam menit
- Recovery dari disaster
- Collaborate dengan team

📈 **Best practices:**
- Professional development workflow
- Data integrity
- Business continuity

---

**Ingat: Backup adalah asuransi. Kita tidak perlu sampai data hilang baru menyesal! 💾🔒**

**Mulai sekarang, lakukan backup rutin! 🚀**


