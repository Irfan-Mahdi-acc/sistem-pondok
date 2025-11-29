# ===========================================
# CARA BUAT FILE .ENV DI VPS
# ===========================================

## Di VPS, jalankan command ini:

```bash
# 1. Masuk ke folder project
cd /var/www/sistem-pondok

# 2. Buat file .env dari template
cp env.production.template .env

# 3. Edit file .env
nano .env
```

## Isi file .env dengan ini:

```env
# ===========================================
# PRODUCTION ENVIRONMENT (VPS)
# ===========================================

# ===========================================
# NODE ENVIRONMENT
# ===========================================
NODE_ENV=production

# ===========================================
# DATABASE - PostgreSQL VPS
# ===========================================
# GANTI dengan kredensial PostgreSQL VPS Anda
DATABASE_URL="postgresql://pondok_user:YOUR_VPS_DB_PASSWORD@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://pondok_user:YOUR_VPS_DB_PASSWORD@localhost:5432/sistem_pondok"

# ===========================================
# AUTHENTICATION - NextAuth
# ===========================================
# SAMA dengan local - sudah di-generate
NEXTAUTH_SECRET="s9qjCtExG2zugfupUWSfundCOGCNho6E6HL0O6FCFMQ="

# GANTI dengan IP VPS Anda
NEXTAUTH_URL="http://72.61.210.79:3000"

# ===========================================
# ENCRYPTION
# ===========================================
# SAMA dengan local - sudah di-generate
ENCRYPTION_KEY="38c5e1c83861cd673c9459c91e4deed3"

# ===========================================
# GOOGLE OAUTH (Optional)
# ===========================================
# Uncomment jika menggunakan Google OAuth
# AUTH_GOOGLE_ID="your-google-client-id"
# AUTH_GOOGLE_SECRET="your-google-client-secret"

# ===========================================
# SECURITY SETTINGS
# ===========================================
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30

# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=3000
HOSTNAME=0.0.0.0
```

## Cara Edit di Nano:

1. **Paste isi di atas** ke dalam nano
2. **Ganti nilai berikut:**
   - `YOUR_VPS_DB_PASSWORD` → Password PostgreSQL VPS Anda
   - `72.61.210.79` → IP VPS Anda (jika berbeda)

3. **Save file:**
   - Tekan `Ctrl + O` (save)
   - Tekan `Enter` (confirm)
   - Tekan `Ctrl + X` (exit)

## Verifikasi File:

```bash
# Cek isi file (tanpa menampilkan secrets)
cat .env | grep -E "NODE_ENV|DATABASE_URL|NEXTAUTH_URL|PORT"
```

Output yang benar:
```
NODE_ENV=production
DATABASE_URL="postgresql://pondok_user:...
NEXTAUTH_URL="http://72.61.210.79:3000"
PORT=3000
```

## Setelah .env Siap:

```bash
# Lanjut deployment
./deploy-vps.sh
```

---

# UNTUK LOCAL (.env.local)

Buat file `.env.local` di root project dengan isi:

```env
# ===========================================
# DEVELOPMENT ENVIRONMENT (LOCAL)
# ===========================================

NODE_ENV=development

# Database Local - Sesuaikan dengan setup Anda
DATABASE_URL="postgresql://postgres:password@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://postgres:password@localhost:5432/sistem_pondok"

# NextAuth
NEXTAUTH_SECRET="s9qjCtExG2zugfupUWSfundCOGCNho6E6HL0O6FCFMQ="
NEXTAUTH_URL="http://localhost:3000"

# Encryption
ENCRYPTION_KEY="38c5e1c83861cd673c9459c91e4deed3"

# Security
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30

# Server
PORT=3000
HOSTNAME=0.0.0.0
```

**Cara buat di Windows:**

1. Buka Notepad atau VS Code
2. Copy paste isi di atas
3. Save as `.env.local` di folder project
4. Pastikan file extension `.local` bukan `.local.txt`

---

# PERBEDAAN LOCAL vs VPS

| Variable | Local | VPS |
|----------|-------|-----|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | Local PostgreSQL | VPS PostgreSQL |
| `NEXTAUTH_URL` | `http://localhost:3000` | `http://72.61.210.79:3000` |
| `NEXTAUTH_SECRET` | **SAMA** | **SAMA** |
| `ENCRYPTION_KEY` | **SAMA** | **SAMA** |

**PENTING:** `NEXTAUTH_SECRET` dan `ENCRYPTION_KEY` harus SAMA antara local dan VPS!
