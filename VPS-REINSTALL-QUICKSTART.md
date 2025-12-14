# Panduan Cepat Reinstall VPS

> [!CAUTION]
> **Ini adalah operasi yang merusak!** Pastikan Anda sudah backup sebelum melanjutkan.

---

## Checklist Pra-Deployment

- [ ] Backup database sudah diunduh
- [ ] File `.env` sudah di-backup
- [ ] Semua kredensial sudah didokumentasikan
- [ ] Pengaturan Google OAuth sudah dicatat
- [ ] Pengaturan DNS domain bisa diakses

---

## Langkah Cepat

### 1. Backup (Jika VPS masih bisa diakses)

```bash
# SSH ke VPS saat ini
ssh root@ip-vps-anda

# Backup database
pg_dump -U postgres sistem_pondok > ~/backup.sql

# Download ke lokal
scp root@ip-vps-anda:~/backup.sql ./
scp root@ip-vps-anda:/var/www/sistem-pondok/.env ./env_backup.txt
```

### 2. Reinstall VPS

1. Panel Hostinger → VPS Management → Operating System
2. Klik "Reinstall OS"
3. Pilih: **Ubuntu 22.04 LTS**
4. Buat password root yang kuat
5. Tunggu 5-10 menit

### 3. Setup Awal

```bash
# SSH ke VPS yang baru
ssh root@ip-vps-anda

# Update sistem
apt update && apt upgrade -y

# Install tools penting
apt install -y curl wget git ufw fail2ban

# Buat user deploy
adduser deploy
usermod -aG sudo deploy
```

### 4. Keamanan SSH (PENTING!)

```bash
# Di komputer LOKAL (Windows PowerShell):
ssh-keygen -t ed25519 -C "email-anda@example.com"
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh deploy@ip-vps-anda "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Di VPS:
sudo nano /etc/ssh/sshd_config
```

Ubah baris ini:
```
PermitRootLogin no
PasswordAuthentication no
Port 2222
```

```bash
# Restart SSH
sudo systemctl restart sshd

# TES di terminal baru SEBELUM menutup sesi saat ini!
ssh -p 2222 deploy@ip-vps-anda
```

### 5. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 6. Install Stack

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'PASSWORD_KUAT_ANDA';"
sudo -u postgres createdb sistem_pondok

# PM2
sudo npm install -g pm2
pm2 startup
# Jalankan command yang ditampilkan

# Nginx
sudo apt install -y nginx
```

### 7. Deploy Aplikasi

```bash
# Clone repo
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone https://github.com/USERNAME_ANDA/sistem-pondok.git
cd sistem-pondok

# Buat .env
nano .env
```

Paste environment variables Anda:
```env
DATABASE_URL="postgresql://postgres:PASSWORD_ANDA@localhost:5432/sistem_pondok?schema=public"
NEXTAUTH_URL="https://tsn.ponpes.id"
NEXTAUTH_SECRET="generate_dengan_openssl_rand_base64_32"
GOOGLE_CLIENT_ID="client-id-anda"
GOOGLE_CLIENT_SECRET="client-secret-anda"
ENCRYPTION_KEY="generate_dengan_openssl_rand_hex_16"
NODE_ENV="production"
```

```bash
# Restore database (copy backup ke VPS dulu)
scp -P 2222 backup.sql deploy@ip-vps-anda:~/
psql -U postgres -d sistem_pondok < ~/backup.sql

# Install & build
npm install
npx prisma generate
npm run build

# Start dengan PM2
pm2 start npm --name "sistem-pondok" -- start
pm2 save
```

### 8. Konfigurasi Nginx

```bash
sudo nano /etc/nginx/sites-available/sistem-pondok
```

Paste konfigurasi ini:

```nginx
server {
    listen 80;
    server_name tsn.ponpes.id;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    server_tokens off;

    # Block eksekusi script di uploads
    location ~* ^/uploads/.*\.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi|exe)$ {
        deny all;
        return 403;
    }

    # Hanya serve gambar dari uploads
    location /uploads/ {
        root /var/www/sistem-pondok/public;
        types {
            image/jpeg jpg jpeg;
            image/png png;
            image/gif gif;
            image/webp webp;
            image/svg+xml svg;
        }
        default_type application/octet-stream;
        add_header X-Content-Type-Options nosniff;
        autoindex off;
        expires 30d;
    }

    # Proxy ke Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Aktifkan site
sudo ln -s /etc/nginx/sites-available/sistem-pondok /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test & reload
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Sertifikat SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tsn.ponpes.id
# Pilih opsi 2: Redirect HTTP ke HTTPS
```

### 10. Keamanan Tambahan

```bash
# Update otomatis
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# ClamAV (Antivirus)
sudo apt install -y clamav clamav-daemon
sudo freshclam

# AIDE (File Integrity Monitoring)
sudo apt install -y aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
```

---

## Verifikasi

```bash
# Cek semua service
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Cek firewall
sudo ufw status

# Test website
curl -I https://tsn.ponpes.id

# Cek logs
pm2 logs sistem-pondok
```

---

## Pasca-Deployment

### Test Upload File

1. Login ke aplikasi Anda
2. Coba upload logo di Lembaga
3. Verifikasi berfungsi dan tampil dengan benar

### Monitor Selama 24 Jam

```bash
# Lihat logs
pm2 logs sistem-pondok --lines 100

# Cek error
sudo tail -f /var/log/nginx/error.log
```

### Setup Backup Otomatis

```bash
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U postgres sistem_pondok > $BACKUP_DIR/sistem_pondok_$DATE.sql
find $BACKUP_DIR -name "sistem_pondok_*.sql" -mtime +7 -delete
```

```bash
chmod +x ~/backup-db.sh
crontab -e
# Tambahkan: 0 1 * * * /home/deploy/backup-db.sh
```

---

## Troubleshooting

### Aplikasi tidak mau start
```bash
pm2 logs sistem-pondok --lines 100
pm2 restart sistem-pondok
```

### Error koneksi database
```bash
psql -U postgres -d sistem_pondok
# Cek DATABASE_URL di .env
```

### Error Nginx
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Tidak bisa SSH
- Pastikan pakai port 2222: `ssh -p 2222 deploy@ip-vps-anda`
- Cek firewall: `sudo ufw status`

---

## Catatan Penting

> [!WARNING]
> - **Selalu test SSH dengan pengaturan baru** sebelum menutup sesi saat ini
> - **Simpan SSH private key Anda** - tanpa ini tidak bisa login
> - **Dokumentasikan password Anda** di password manager yang aman
> - **Test backup secara berkala** - backup yang tidak ditest tidak berguna

> [!TIP]
> - Gunakan `screen` atau `tmux` untuk command yang lama
> - Simpan copy panduan ini saat deployment
> - Screenshot langkah-langkah penting
> - Dokumentasikan penyimpangan dari panduan ini

---

## Butuh Detail Lebih?

Lihat panduan lengkap:
- [`VPS-REINSTALL-SECURITY-GUIDE.md`](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/VPS-REINSTALL-SECURITY-GUIDE.md) - Langkah detail lengkap
- [`SECURITY-HARDENING.md`](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/SECURITY-HARDENING.md) - Best practices keamanan
- [`walkthrough.md`](file:///C:/Users/GAMING%203i/.gemini/antigravity/brain/6b9cabd4-0cbf-4638-949e-0dfbcf2e9db6/walkthrough.md) - Apa yang diperbaiki dan mengapa

---

**Semoga berhasil! 🚀**
