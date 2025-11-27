# 🛡️ Strategi Backup Lengkap - Sistem Web Pondok

Panduan lengkap untuk menjaga dan mengamankan progress Anda.

---

## 🎯 3 Layer Proteksi:

### Layer 1: Git Version Control ✅ (SUDAH AKTIF)
**Untuk:** Source code & konfigurasi  
**Status:** ✅ Sudah setup  
**Backup:** Real-time setiap commit

### Layer 2: Database & Files Backup (PENTING!)
**Untuk:** Data & file uploads  
**Frekuensi:** Harian/Mingguan  
**Tools:** Script PowerShell yang sudah disediakan

### Layer 3: Cloud Backup (RECOMMENDED)
**Untuk:** Disaster recovery  
**Platform:** GitHub + Cloud Storage  
**Frekuensi:** Otomatis

---

## 📁 File yang Perlu Di-Backup:

### 🔴 CRITICAL (Backup Harian):
1. **Database:** `prisma/dev.db`
   - Berisi SEMUA data (santri, nilai, keuangan, dll)
   - File paling penting!
   - Script: `backup-database.ps1`

2. **Environment Variables:** `.env`
   - Berisi password & API keys
   - Script: `backup-env.ps1`

### 🟡 IMPORTANT (Backup Mingguan):
3. **Uploaded Files:** `public/uploads/*`
   - Foto santri, dokumen
   - Bisa jadi besar

4. **Config Files:**
   - `package.json`
   - `next.config.ts`
   - `prisma/schema.prisma`

### 🟢 LOW PRIORITY (Git sudah handle):
5. **Source Code:** `src/*`
   - Sudah di-backup via Git ✅
   - Push ke GitHub untuk cloud backup

---

## 🚀 Cara Menggunakan Script Backup:

### 1. Backup Database (Cepat - 2 detik)
```powershell
.\backup-database.ps1
```
**Apa yang dilakukan:**
- Backup database dengan timestamp
- Keep 30 backup terbaru
- Simpan di folder `backups/database/`

**Kapan:** Setiap hari atau sebelum perubahan besar

---

### 2. Backup Environment Variables
```powershell
.\backup-env.ps1
```
**Apa yang dilakukan:**
- Backup file .env
- Simpan di folder `backups/env/`

**Kapan:** Setelah ubah password/API keys

---

### 3. Backup Lengkap (5-30 detik)
```powershell
.\backup-all.ps1
```
**Apa yang dilakukan:**
- Backup database
- Backup .env
- Backup uploads (jika tidak terlalu besar)
- Backup config files
- Buat folder lengkap dengan timestamp

**Kapan:** Seminggu sekali atau sebelum update besar

---

### 4. Setup Backup Otomatis (Sekali setup)
```powershell
.\schedule-backup.ps1
```
**Apa yang dilakukan:**
- Setup Windows Task Scheduler
- Backup database otomatis setiap hari
- Pilih jam backup (recommended: malam hari)

**Best Practice:** Set jam 23:00 atau 02:00

---

## 📅 Jadwal Backup Recommended:

### Harian (Otomatis):
- ✅ Database backup via scheduled task
- ⏰ Jam 23:00 setiap malam

### Mingguan (Manual):
- 📦 Backup lengkap: `.\backup-all.ps1`
- 📅 Setiap hari Jumat sore

### Bulanan:
- ☁️ Upload backup ke cloud storage
- 💾 Copy ke external drive/USB
- 📅 Setiap akhir bulan

### Sebelum Update Besar:
- 🔄 Backup lengkap + Git commit
- 📝 Catat versi & tanggal
- 🧪 Test di development dulu

---

## ☁️ Cloud Backup Strategy:

### 1. GitHub (Source Code) - PRIORITAS TINGGI
**Setup:** Baca `GITHUB-SETUP-GUIDE.md`

**Apa yang di-backup:**
- ✅ Semua source code
- ✅ Config files
- ✅ Database schema
- ✅ Migrations

**Tidak di-backup:**
- ❌ Database file (terlalu besar & sering berubah)
- ❌ .env (security risk)
- ❌ Uploads (terlalu besar)

**Command:**
```powershell
git add .
git commit -m "Progress update"
git push origin main
```

---

### 2. OneDrive/Google Drive (Database & Uploads)

**Setup:**
1. Install OneDrive/Google Drive Desktop
2. Buat folder khusus backup
3. Copy backup folder ke sana

**Automated:**
```powershell
# Edit backup-all.ps1, tambahkan di akhir:
# Copy-Item -Path "backups" -Destination "C:\Users\[USER]\OneDrive\PondokBackup" -Recurse -Force
```

---

### 3. External Drive (Full Backup)

**Frekuensi:** Bulanan  
**Apa yang di-backup:** SEMUA (termasuk node_modules)

**Command:**
```powershell
# Copy seluruh project
$destination = "E:\Backup\SistemPondok_$(Get-Date -Format 'yyyy-MM')"
Copy-Item -Path "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah" -Destination $destination -Recurse
```

---

## 🔄 Restore dari Backup:

### Restore Database:
```powershell
# 1. Stop server dulu
# 2. Restore database
Copy-Item -Path "backups\database\dev_backup_2025-11-27_23-00-00.db" -Destination "prisma\dev.db" -Force
# 3. Start server lagi
```

### Restore .env:
```powershell
Copy-Item -Path "backups\env\.env_backup_2025-11-27.txt" -Destination ".env" -Force
```

### Restore dari GitHub:
```powershell
# Clone repository di komputer baru
git clone https://github.com/[USERNAME]/sistem-web-pondok.git

# Install dependencies
npm install

# Setup .env (manual dari backup)
# Copy database (manual dari backup)

# Run
npm run dev
```

---

## ⚠️ PENTING - Jangan Lupa!

### ❌ JANGAN Commit Ini ke Git:
- `.env` - Password & API keys
- `prisma/*.db` - Database file
- `public/uploads/*` - User uploads
- `node_modules/` - Dependencies
- `.next/` - Build files

Semua sudah di-handle oleh `.gitignore` ✅

### ✅ HARUS Backup Manual:
- Database file (`prisma/dev.db`)
- Environment variables (`.env`)
- Uploaded files (`public/uploads/`)

---

## 🧪 Testing Backup:

### Test 1: Database Restore
```powershell
# 1. Backup current database
.\backup-database.ps1

# 2. Ubah data di database (tambah santri test)

# 3. Restore dari backup
$latestBackup = Get-ChildItem "backups\database" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $latestBackup.FullName -Destination "prisma\dev.db" -Force

# 4. Cek apakah data kembali
```

### Test 2: Git Restore
```powershell
# 1. Commit current state
git add .
git commit -m "Test checkpoint"

# 2. Ubah beberapa file

# 3. Restore
git reset --hard HEAD
# Semua perubahan kembali
```

---

## 📊 Monitoring Backup:

### Cek Backup Database:
```powershell
# Lihat list backup
Get-ChildItem "backups\database" | Sort-Object LastWriteTime -Descending | Select-Object Name, LastWriteTime, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}}
```

### Cek Scheduled Task:
```powershell
# Lihat status task
Get-ScheduledTask -TaskName "PondokSystemBackup" | Select-Object TaskName, State, LastRunTime, NextRunTime
```

### Cek Git Status:
```powershell
# Uncommitted changes
git status

# Last commits
git log --oneline -5
```

---

## 💾 Storage Management:

### Cleanup Old Backups:
Backup database otomatis keep 30 terbaru saja.

Manual cleanup:
```powershell
# Hapus backup lebih dari 60 hari
$cutoffDate = (Get-Date).AddDays(-60)
Get-ChildItem "backups" -Recurse -File | Where-Object {$_.LastWriteTime -lt $cutoffDate} | Remove-Item
```

### Estimasi Storage:
- Database: ~10-100 MB (tergantung data)
- 30 backup database: ~300 MB - 3 GB
- Uploads: Variable (bisa GB)
- Source code: ~50 MB

**Total recommended:** Minimal 10 GB free space

---

## 🆘 Disaster Recovery Plan:

### Skenario 1: Laptop Rusak
**Recovery:**
1. Install Git di laptop baru
2. Clone dari GitHub: `git clone [URL]`
3. Install dependencies: `npm install`
4. Restore database dari cloud backup
5. Setup .env dari backup
6. Run: `npm run dev`

**Waktu recovery:** 30-60 menit

---

### Skenario 2: Database Corrupt
**Recovery:**
1. Stop server
2. Restore database: `Copy-Item "backups\database\[latest].db" -Destination "prisma\dev.db" -Force`
3. Start server
4. Verify data

**Waktu recovery:** 2-5 menit

---

### Skenario 3: Code Error Besar
**Recovery:**
1. Lihat history: `git log --oneline`
2. Reset ke commit baik: `git reset --hard [commit-hash]`
3. Test aplikasi
4. Jika perlu, cherry-pick perubahan yang bagus

**Waktu recovery:** 5-15 menit

---

### Skenario 4: Kehilangan .env
**Recovery:**
1. Restore dari backup: `backups\env\`
2. Atau setup ulang (regenerate passwords)

**Waktu recovery:** 5-10 menit

---

## 📞 Quick Reference:

| Task | Command | Frekuensi |
|------|---------|-----------|
| Backup database | `.\backup-database.ps1` | Harian |
| Backup lengkap | `.\backup-all.ps1` | Mingguan |
| Git commit | `git add . && git commit -m "msg"` | Setelah perubahan |
| Git push | `git push origin main` | Harian |
| Setup auto backup | `.\schedule-backup.ps1` | Sekali |
| Cek backup | `dir backups\database` | Kapan saja |

---

## ✅ Checklist Setup Backup:

- [ ] Git sudah setup (✅ DONE!)
- [ ] Test backup database: `.\backup-database.ps1`
- [ ] Setup scheduled backup: `.\schedule-backup.ps1`
- [ ] Backup .env: `.\backup-env.ps1`
- [ ] Push ke GitHub (baca `GITHUB-SETUP-GUIDE.md`)
- [ ] Test restore database
- [ ] Setup cloud storage sync (OneDrive/Google Drive)
- [ ] Buat backup ke external drive
- [ ] Catat lokasi semua backup
- [ ] Set reminder untuk backup mingguan

---

**🎯 Target: Zero Data Loss!**

Dengan strategi ini, data Anda aman dari:
- ✅ Hardware failure
- ✅ Human error
- ✅ Software bugs
- ✅ Ransomware (jika backup offline)
- ✅ Accidental deletion

**Backup adalah investasi, bukan cost! 💾🔒**


