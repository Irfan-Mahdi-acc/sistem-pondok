# 🌐 GitHub Setup Guide - Backup Online

Repository lokal Anda sudah siap! Sekarang saatnya backup ke cloud (GitHub) untuk keamanan maksimal.

---

## 📋 Langkah 1: Buat Akun GitHub

1. **Buka:** https://github.com
2. **Sign Up** (jika belum punya akun)
   - Username: pilih yang mudah diingat
   - Email: gunakan email aktif Anda
   - Password: gunakan password yang kuat
3. **Verify email** Anda

---

## 📦 Langkah 2: Buat Repository Baru

### Di Website GitHub:

1. **Login** ke GitHub
2. Klik tombol **"+"** di kanan atas → **"New repository"**
3. **Isi form:**
   - Repository name: `sistem-web-pondok` (atau nama lain)
   - Description: "Sistem Manajemen Pondok Tadzimussunnah"
   - Pilih: **Private** ⚠️ (PENTING untuk keamanan!)
   - ❌ **JANGAN centang** "Initialize this repository with a README"
4. Klik **"Create repository"**

### Setelah Buat Repository:

GitHub akan menampilkan halaman dengan instruksi. **COPY URL repository** Anda.
Format URL: `https://github.com/[USERNAME]/sistem-web-pondok.git`

---

## 🔗 Langkah 3: Link Repository Lokal ke GitHub

### Di PowerShell/Terminal:

Jalankan command berikut (ganti `[URL_REPOSITORY]` dengan URL yang Anda copy):

```powershell
# Pindah ke folder project
cd "D:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah"

# Link ke GitHub
git remote add origin [URL_REPOSITORY]

# Contoh:
# git remote add origin https://github.com/username/sistem-web-pondok.git

# Verifikasi
git remote -v
```

---

## 🚀 Langkah 4: Push ke GitHub

### Push Initial Commit:

```powershell
# Push ke GitHub
git push -u origin main
```

**⚠️ PENTING:** Anda akan diminta login GitHub:
- Masukkan **username** GitHub Anda
- Untuk password, gunakan **Personal Access Token** (bukan password biasa)

### Cara Buat Personal Access Token:

1. **Di GitHub**, klik foto profil → **Settings**
2. Scroll ke bawah → **Developer settings**
3. Klik **Personal access tokens** → **Tokens (classic)**
4. Klik **Generate new token** → **Generate new token (classic)**
5. Beri nama: "Sistem Pondok Access"
6. Pilih scope: **✅ repo** (centang semua)
7. Klik **Generate token**
8. **COPY TOKEN** (muncul sekali saja!)
9. **Simpan token** di tempat aman

Gunakan token ini sebagai password saat push.

---

## ✅ Verifikasi Setup Berhasil

Setelah push berhasil:

1. **Buka repository GitHub** Anda di browser
2. **Refresh halaman**
3. Anda akan melihat semua file project Anda!

---

## 📱 Penggunaan Sehari-hari

### Setiap Kali Ada Perubahan Code:

```powershell
# 1. Add perubahan
git add .

# 2. Commit dengan pesan jelas
git commit -m "Deskripsi perubahan"

# 3. Push ke GitHub
git push origin main
```

### Pull Perubahan dari GitHub (jika ada):

```powershell
git pull origin main
```

---

## 🔐 Keamanan

### File yang TIDAK Di-Upload ke GitHub:

Sudah dikonfigurasi di `.gitignore`:
- ❌ `.env` - Environment variables (password, API keys)
- ❌ `prisma/*.db` - Database file (data santri sensitif)
- ❌ `public/uploads/*` - File upload users
- ❌ `node_modules/` - Dependencies (terlalu besar)

### PENTING:
- ✅ Pastikan repository Anda **PRIVATE**
- ✅ Jangan share Personal Access Token
- ✅ Backup `.env` file terpisah (JANGAN commit ke Git!)
- ✅ Backup database secara manual (file `prisma/dev.db`)

---

## 🎯 Manfaat Backup ke GitHub

1. **☁️ Cloud Backup** - Code aman meskipun laptop rusak
2. **📜 History Lengkap** - Lihat semua perubahan dari awal
3. **↩️ Rollback Mudah** - Kembali ke versi sebelumnya kapan saja
4. **👥 Kolaborasi** - Developer lain bisa contribute
5. **🤖 CI/CD** - Auto-deploy ke server (advanced)
6. **📱 Akses Dimana Saja** - Clone repository di komputer lain

---

## 🆘 Troubleshooting

### Error: "remote origin already exists"

```powershell
git remote remove origin
git remote add origin [URL_REPOSITORY]
```

### Error: "failed to push"

```powershell
# Pull dulu
git pull origin main --rebase

# Lalu push lagi
git push origin main
```

### Lupa Personal Access Token

Generate token baru di GitHub Settings → Developer settings

---

## 📞 Backup Alternatif: GitLab

Jika tidak mau pakai GitHub, bisa pakai GitLab:

1. Buka: https://gitlab.com
2. Buat akun & repository private
3. Link repository:
```powershell
git remote add origin https://gitlab.com/[USERNAME]/sistem-web-pondok.git
git push -u origin main
```

---

## 🎉 Selamat!

Setelah setup selesai, project Anda sudah aman dengan:
- ✅ Git version control lokal
- ✅ Backup di cloud (GitHub/GitLab)
- ✅ History lengkap semua perubahan
- ✅ Recovery point jika ada masalah

**Happy Coding! 🚀**


