# Panduan Migrasi Database dari Supabase ke VPS

Panduan ini akan membantu Anda memindahkan database dari Supabase (Cloud) ke VPS Hostinger Anda (Self-Hosted).

## Langkah 1: Install PostgreSQL di VPS

1.  Upload script `install-db.sh` ke VPS (atau buat file baru di sana).
    ```bash
    # Di terminal lokal Anda (PowerShell/CMD)
    scp install-db.sh root@72.61.210.79:/root/
    ```
    *Jika `scp` tidak jalan, Anda bisa copy-paste isi file `install-db.sh` ke file baru di VPS menggunakan `nano install-db.sh`.*

2.  Jalankan script di VPS:
    ```bash
    # Login ke VPS
    ssh root@72.61.210.79

    # Beri izin eksekusi
    chmod +x install-db.sh

    # Jalankan
    ./install-db.sh
    ```
    *Catat password yang muncul di akhir script!*

## Langkah 2: Backup Data dari Supabase

Kita akan mengambil data dari Supabase menggunakan `pg_dump`. Anda butuh Connection String Supabase (dari `.env` lama atau Dashboard Supabase).

1.  Di komputer lokal (pastikan sudah install PostgreSQL Client / pg_dump), jalankan:
    ```bash
    # Format: pg_dump "CONNECTION_STRING_SUPABASE" > backup.sql
    
    # Contoh (Ganti PASSWORD dengan password DB Supabase Anda):
    pg_dump "postgresql://postgres.lvlthftraeqqyveolzsm:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" > backup.sql
    ```
    *Jika tidak punya `pg_dump` di lokal, Anda bisa lakukan ini dari dalam VPS jika VPS sudah terinstall postgresql-client.*

## Langkah 3: Restore Data ke VPS

1.  Upload file `backup.sql` ke VPS:
    ```bash
    scp backup.sql root@72.61.210.79:/root/
    ```

2.  Di terminal VPS, import data ke database baru:
    ```bash
    # Login ke VPS
    ssh root@72.61.210.79

    # Import data (masukkan password 'password_db_baru' saat diminta)
    psql -U pondok_user -d sistem_pondok -f backup.sql
    ```

## Langkah 4: Update Aplikasi

1.  Edit file `.env` di VPS:
    ```bash
    nano /var/www/sistem-pondok/.env
    ```

2.  Ubah `DATABASE_URL` menjadi localhost:
    ```env
    # Ganti 'password_db_baru' sesuai yang ada di script install-db.sh
    DATABASE_URL="postgresql://pondok_user:password_db_baru@localhost:5432/sistem_pondok"
    DIRECT_URL="postgresql://pondok_user:password_db_baru@localhost:5432/sistem_pondok"
    ```

3.  Restart Aplikasi:
    ```bash
    pm2 restart sistem-pondok
    ```

## Selesai!
Sekarang database Anda sudah berjalan lokal di VPS. Lebih cepat dan gratis!
