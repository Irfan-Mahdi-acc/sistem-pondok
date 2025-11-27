# 📚 Git Workflow - Sistem Web Pondok Tadzimussunnah

## 🚀 Setup Awal (Sekali Saja)

### 1. Install Git
- Download: https://git-scm.com/download/win
- Restart PowerShell setelah install

### 2. Jalankan Setup Script
```powershell
.\git-init-setup.ps1
```

Script ini akan:
- ✅ Konfigurasi user Git Anda
- ✅ Initialize repository
- ✅ Membuat commit pertama
- ✅ Backup semua progress Anda

---

## 📋 Penggunaan Sehari-hari

### Setiap Kali Selesai Coding

```powershell
# 1. Cek perubahan apa saja yang ada
git status

# 2. Tambahkan file yang diubah
git add .

# 3. Commit dengan pesan yang jelas
git commit -m "Deskripsi perubahan"
```

### Contoh Commit Message yang Baik

```powershell
# ✅ Baik - jelas dan deskriptif
git commit -m "Tambah fitur input nilai ujian"
git commit -m "Fix bug pada halaman rapor santri"
git commit -m "Update tampilan dashboard admin"

# ❌ Kurang baik - terlalu umum
git commit -m "update"
git commit -m "fix"
```

---

## 🔄 Workflow Harian Recommended

### Pagi (Sebelum Mulai Coding)
```powershell
# Jika ada remote repository
git pull origin main
```

### Setelah Fitur/Fix Selesai
```powershell
git add .
git commit -m "Selesai fitur [nama fitur]"
```

### Malam (Sebelum Selesai Kerja)
```powershell
# Commit progress hari ini
git add .
git commit -m "Progress hari ini: [deskripsi]"

# Push ke remote (jika ada)
git push origin main
```

---

## 🌿 Branching untuk Fitur Baru

### Buat Branch Baru untuk Fitur
```powershell
# Buat dan pindah ke branch baru
git checkout -b fitur-[nama-fitur]

# Contoh:
git checkout -b fitur-input-nilai
git checkout -b fix-bug-rapor
```

### Setelah Fitur Selesai
```powershell
# 1. Commit di branch fitur
git add .
git commit -m "Selesai fitur [nama]"

# 2. Kembali ke branch main
git checkout main

# 3. Merge fitur ke main
git merge fitur-[nama-fitur]

# 4. Hapus branch (opsional)
git branch -d fitur-[nama-fitur]
```

---

## 🔙 Membatalkan Perubahan

### Membatalkan File yang Belum di-Commit
```powershell
# Batalkan perubahan 1 file
git checkout -- namafile.ts

# Batalkan semua perubahan
git reset --hard
```

### Kembali ke Commit Sebelumnya
```powershell
# Lihat history commit
git log --oneline

# Kembali ke commit tertentu (buat data)
git reset --soft [commit-hash]

# Kembali dan buang perubahan
git reset --hard [commit-hash]
```

---

## ☁️ Setup Remote Repository (GitHub/GitLab)

### GitHub (Recommended)

1. **Buat Repository Baru di GitHub:**
   - Buka https://github.com
   - Klik "New repository"
   - Nama: `sistem-web-pondok`
   - Pilih "Private" (untuk keamanan)
   - Jangan centang "Initialize with README"
   - Klik "Create repository"

2. **Link ke Repository Lokal:**
```powershell
git remote add origin https://github.com/[username]/sistem-web-pondok.git
git branch -M main
git push -u origin main
```

3. **Push Perubahan:**
```powershell
# Setiap kali ada commit baru
git push origin main
```

### GitLab (Alternatif)

1. Buat repository di https://gitlab.com
2. Link:
```powershell
git remote add origin https://gitlab.com/[username]/sistem-web-pondok.git
git branch -M main
git push -u origin main
```

---

## 🔐 File yang Tidak Di-Commit

File-file berikut otomatis diabaikan (lihat `.gitignore`):

- ❌ `node_modules/` - dependencies (terlalu besar)
- ❌ `.env*` - environment variables (rahasia)
- ❌ `prisma/*.db` - database file (data sensitif)
- ❌ `public/uploads/*` - file upload users (bisa besar)
- ❌ `.next/` - build files (generated)

---

## 📊 Command Berguna

```powershell
# Status repository
git status

# History commit
git log --oneline --graph --all

# Lihat perubahan yang belum di-commit
git diff

# Lihat perubahan file tertentu
git diff namafile.ts

# Lihat branch yang ada
git branch

# Lihat remote repository
git remote -v
```

---

## 🆘 Troubleshooting

### Error: "Author identity unknown"
```powershell
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"
```

### Error: "Not a git repository"
```powershell
# Pastikan Anda di folder project
cd "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"
git init
```

### Merge Conflict
```powershell
# 1. Edit file yang conflict (hapus marker <<< === >>>)
# 2. Add file yang sudah diperbaiki
git add namafile.ts
# 3. Commit
git commit -m "Resolve merge conflict"
```

---

## 💡 Tips Best Practices

1. ✅ **Commit Sering** - Jangan tunggu terlalu banyak perubahan
2. ✅ **Commit Message Jelas** - Tulis deskripsi yang informatif
3. ✅ **Gunakan Branch** - Untuk fitur baru atau eksperimen
4. ✅ **Push Rutin** - Ke remote repository untuk backup
5. ✅ **Review Sebelum Commit** - Pakai `git status` dan `git diff`
6. ❌ **Jangan Commit File Sensitive** - .env, database, password
7. ❌ **Jangan Commit node_modules** - Gunakan npm install

---

## 📞 Butuh Bantuan?

Jika ada masalah dengan Git:
1. Cek dokumentasi: https://git-scm.com/doc
2. Tutorial: https://try.github.io
3. Atau tanya AI assistant Anda! 😊

