# VPS Deployment Troubleshooting - Step by Step

## 🔴 Error yang Anda Alami

Dari screenshot:
```
cd: command not found
cp: cannot stat 'env.production.template': No such file or directory
```

---

## ✅ Solusi: Setup dari Awal

### Step 1: Cek Lokasi Anda Saat Ini

```bash
pwd
```

Output akan menunjukkan direktori saat ini, misalnya: `/root` atau `/var/www`

### Step 2: Cek Apakah Folder sistem-pondok Ada

```bash
ls -la
```

Jika **TIDAK ADA** folder `sistem-pondok`, lanjut ke Step 3.
Jika **ADA**, lanjut ke Step 4.

---

## 📥 Step 3: Clone Repository (Jika Belum Ada)

```bash
# Pastikan Anda di /var/www
cd /var/www

# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git sistem-pondok

# Masuk ke folder
cd sistem-pondok

# Cek isi folder
ls -la
```

**⚠️ Ganti:**
- `YOUR_USERNAME` dengan username GitHub Anda
- `YOUR_REPO_NAME` dengan nama repository Anda

---

## 📂 Step 4: Masuk ke Folder Proyek

```bash
# Gunakan path lengkap
cd /var/www/sistem-pondok

# Atau jika Anda sudah di /var/www
cd sistem-pondok

# Cek isi folder
ls -la
```

**Yang harus ada:**
- `package.json`
- `next.config.ts`
- `prisma/`
- `src/`
- `ecosystem.config.js` (file baru)
- `deploy-vps.sh` (file baru)
- `env.production.template` (file baru)

---

## 🔄 Step 5: Pull Latest Changes

Jika folder sudah ada tapi file-file baru belum ada:

```bash
# Pastikan di folder proyek
cd /var/www/sistem-pondok

# Pull latest changes
git pull origin main

# Cek apakah file baru sudah ada
ls -la | grep -E "ecosystem|deploy|env.production"
```

**Output yang diharapkan:**
```
-rw-r--r-- 1 root root  xxx deploy-vps.sh
-rw-r--r-- 1 root root  xxx ecosystem.config.js
-rw-r--r-- 1 root root  xxx env.production.template
```

---

## ⚙️ Step 6: Setup Environment

```bash
# Copy template
cp env.production.template .env

# Edit file
nano .env
```

**Isi dengan:**

```env
NODE_ENV=production

# Database - GANTI dengan kredensial Anda
DATABASE_URL="postgresql://pondok_user:YOUR_PASSWORD@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://pondok_user:YOUR_PASSWORD@localhost:5432/sistem_pondok"

# NextAuth - Generate secret baru
NEXTAUTH_SECRET="PASTE_HASIL_OPENSSL_DIBAWAH"
NEXTAUTH_URL="http://YOUR_VPS_IP:3000"

# Encryption - Generate key baru
ENCRYPTION_KEY="PASTE_HASIL_OPENSSL_DIBAWAH"

# Security
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30

# Server
PORT=3000
HOSTNAME=0.0.0.0
```

**Generate secrets:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 16
```

Copy hasil generate dan paste ke file `.env`.

**Save file:**
- Tekan `Ctrl + O` (save)
- Tekan `Enter` (confirm)
- Tekan `Ctrl + X` (exit)

---

## 📦 Step 7: Install Dependencies

```bash
npm install
```

Tunggu sampai selesai (bisa 2-5 menit).

---

## 🗄️ Step 8: Setup Database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

---

## 🏗️ Step 9: Build Application

```bash
npm run build
```

Tunggu sampai selesai (bisa 3-10 menit).

---

## 📁 Step 10: Copy Static Files

```bash
# Copy public folder
cp -r public .next/standalone/

# Create uploads directory
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads
```

---

## 🚀 Step 11: Start with PM2

```bash
# Make deploy script executable
chmod +x deploy-vps.sh

# Start with PM2
npm run pm2:start

# Save PM2 config
pm2 save

# Setup auto-start
pm2 startup
```

**PENTING:** Copy command yang muncul dari `pm2 startup` dan jalankan!

---

## ✅ Step 12: Verify

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs web --lines 20

# Test di browser
# Buka: http://YOUR_VPS_IP:3000
```

---

## 🔧 Troubleshooting Spesifik

### Error: "cd: command not found"

Ini sangat tidak normal. Coba:

```bash
# Gunakan path lengkap
/bin/cd /var/www/sistem-pondok

# Atau langsung
cd /var/www/sistem-pondok
```

Jika masih error, mungkin ada masalah dengan shell. Coba:

```bash
# Cek shell Anda
echo $SHELL

# Restart shell
exec bash
```

### Error: "env.production.template: No such file"

Artinya file belum ada di VPS. Solusi:

**Option 1: Pull dari Git**
```bash
cd /var/www/sistem-pondok
git pull origin main
ls -la | grep env.production.template
```

**Option 2: Buat Manual**
```bash
cd /var/www/sistem-pondok
nano env.production.template
```

Paste isi file dari local Anda, lalu save.

**Option 3: Copy dari Local ke VPS**
```bash
# Di local machine (PowerShell/CMD)
scp d:\OneDrive\1. Pondok\Sistem Web Pondok Tadzimussunnah\env.production.template user@YOUR_VPS_IP:/var/www/sistem-pondok/
```

### Error: Git Authentication

Jika `git pull` minta username/password:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# View public key
cat ~/.ssh/id_ed25519.pub

# Copy output dan tambahkan ke GitHub:
# GitHub → Settings → SSH and GPG keys → New SSH key

# Test connection
ssh -T git@github.com

# Change remote to SSH
cd /var/www/sistem-pondok
git remote set-url origin git@github.com:USERNAME/REPO.git
```

---

## 📋 Quick Checklist

Sebelum deploy, pastikan:

- [ ] Folder `/var/www/sistem-pondok` ada
- [ ] File `env.production.template` ada
- [ ] File `ecosystem.config.js` ada
- [ ] File `deploy-vps.sh` ada
- [ ] Git pull berhasil
- [ ] PostgreSQL running
- [ ] PM2 installed

Cek dengan:
```bash
cd /var/www/sistem-pondok
ls -la | grep -E "env.production|ecosystem|deploy"
systemctl status postgresql
pm2 --version
```

---

## 🆘 Jika Masih Error

1. **Screenshot error lengkap** dan kirim
2. **Jalankan command ini** dan kirim hasilnya:
   ```bash
   pwd
   ls -la
   git status
   git remote -v
   ```

3. **Cek log PM2** jika sudah running:
   ```bash
   pm2 logs web --lines 50
   ```

---

## 📞 Command Reference

| Task | Command |
|------|---------|
| Cek lokasi | `pwd` |
| List files | `ls -la` |
| Masuk folder | `cd /var/www/sistem-pondok` |
| Pull latest | `git pull origin main` |
| Install deps | `npm install` |
| Build | `npm run build` |
| Start PM2 | `npm run pm2:start` |
| Check PM2 | `pm2 status` |
| View logs | `pm2 logs web` |

---

**Mulai dari Step 1 dan ikuti satu per satu!** 🚀
