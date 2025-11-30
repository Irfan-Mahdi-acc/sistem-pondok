# Panduan Instalasi PostgreSQL di Windows

Untuk menyamakan environment dengan VPS, Anda perlu menginstall PostgreSQL di komputer Anda.

## 1. Download Installer

1.  Kunjungi website resmi: **[https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)**
2.  Klik tombol **Download** pada baris **Windows x86-64** (versi 16.x atau terbaru).
3.  Tunggu download selesai.

## 2. Proses Instalasi

1.  Jalankan file installer `.exe` yang sudah didownload.
2.  Klik **Next** terus sampai bagian **Password**.
3.  ⚠️ **PENTING: Set Password**
    *   Masukkan password yang mudah diingat (misal: `admin123` atau `postgres`).
    *   **CATAT password ini!** Anda akan membutuhkannya untuk file `.env.local`.
4.  **Port**: Biarkan default `5432`.
5.  **Locale**: Biarkan default.
6.  Lanjutkan instalasi sampai selesai (**Finish**).

## 3. Verifikasi Instalasi

1.  Buka menu Start, cari **pgAdmin 4** dan jalankan.
2.  Atau buka **Command Prompt / PowerShell** dan ketik:
    ```powershell
    psql --version
    ```
    (Jika error, Anda mungkin perlu restart komputer atau add to PATH).

## 4. Buat Database Baru

Setelah install, kita perlu buat database untuk aplikasi.

1.  Buka **pgAdmin 4**.
2.  Login dengan password yang Anda buat tadi.
3.  Klik kanan pada **Databases** > **Create** > **Database...**
4.  Beri nama: `sistem_pondok`
5.  Klik **Save**.

## 5. Update Environment Local

Setelah database siap, update file `.env.local` Anda:

```env
# Ganti 'PASSWORD_ANDA' dengan password yang Anda set saat install
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/sistem_pondok"
```

## 6. Setup Database Aplikasi

Jalankan command ini di terminal VS Code:

```powershell
# Push schema ke database local baru
npx prisma db push

# Generate client
npx prisma generate

# (Opsional) Seed data jika ada
npx prisma db seed
```
