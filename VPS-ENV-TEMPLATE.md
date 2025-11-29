# VPS Environment Configuration Template

Template file `.env` untuk deployment di VPS Hostinger dengan PostgreSQL lokal.

## Instruksi Setup

1. **Backup file `.env` yang ada** (jika ada)
2. **Copy template ini** ke file `.env` di root project
3. **Isi nilai-nilai yang diperlukan** sesuai konfigurasi VPS Anda
4. **JANGAN commit** file `.env` ke Git!

---

## Template .env untuk VPS

```env
# ===========================================
# DATABASE - PostgreSQL Lokal di VPS
# ===========================================

# Koneksi ke PostgreSQL lokal
# Format: postgresql://[user]:[password]@localhost:5432/[database_name]
DATABASE_URL="postgresql://pondok_user:password_db_baru@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://pondok_user:password_db_baru@localhost:5432/sistem_pondok"

# ===========================================
# AUTHENTICATION - NextAuth
# ===========================================

# Secret key untuk NextAuth (minimal 32 karakter)
# Generate dengan: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-replace-this"

# URL aplikasi Anda
# Development: http://localhost:3000
# Production: https://yourdomain.com
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# ENCRYPTION (untuk data sensitif)
# ===========================================

# Encryption key (harus 32 karakter)
# Generate dengan: openssl rand -hex 16
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# ===========================================
# GOOGLE OAUTH (Opsional)
# ===========================================

# Jika menggunakan Google OAuth, isi kredensial dari Google Cloud Console
# AUTH_GOOGLE_ID="your-google-client-id"
# AUTH_GOOGLE_SECRET="your-google-client-secret"

# ===========================================
# SECURITY SETTINGS (Opsional)
# ===========================================

MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30
```

---

## Cara Mengisi Nilai-Nilai

### 1. Database Configuration

Sesuaikan dengan konfigurasi PostgreSQL di VPS Anda:

```env
DATABASE_URL="postgresql://pondok_user:password_db_baru@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://pondok_user:password_db_baru@localhost:5432/sistem_pondok"
```

**Catatan:**
- `pondok_user` = username PostgreSQL
- `password_db_baru` = password PostgreSQL
- `sistem_pondok` = nama database
- Lihat file `install-db.sh` atau `DATABASE_MIGRATION.md` untuk detail

### 2. NextAuth Secret

Generate secret key baru:

```bash
# Di terminal VPS atau lokal
openssl rand -base64 32
```

Copy hasilnya ke `NEXTAUTH_SECRET`.

### 3. Encryption Key

Generate encryption key (harus 32 karakter):

```bash
# Di terminal VPS atau lokal
openssl rand -hex 16
```

Copy hasilnya ke `ENCRYPTION_KEY`.

### 4. NextAuth URL

- **Development:** `http://localhost:3000`
- **Production VPS:** `http://72.61.210.79:3000` atau domain Anda

---

## Verifikasi Setup

Setelah mengisi `.env`, verifikasi dengan:

```bash
# Test koneksi database
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Test build
npm run build
```

---

## Troubleshooting

### Database Connection Error

Jika ada error koneksi database:

1. Cek PostgreSQL service running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Cek kredensial database benar
3. Cek PostgreSQL menerima koneksi lokal di `/etc/postgresql/*/main/pg_hba.conf`

### NextAuth Error

Jika ada error authentication:

1. Pastikan `NEXTAUTH_SECRET` terisi (minimal 32 karakter)
2. Pastikan `NEXTAUTH_URL` sesuai dengan URL aplikasi

---

## File Terkait

- [DATABASE_MIGRATION.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/DATABASE_MIGRATION.md) - Panduan migrasi database
- [DEPLOYMENT.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/DEPLOYMENT.md) - Panduan deployment ke VPS
- `install-db.sh` - Script instalasi PostgreSQL
