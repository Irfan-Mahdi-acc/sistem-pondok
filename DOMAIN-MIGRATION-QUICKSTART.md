# 🚀 Quick Start: Domain Migration

Panduan singkat untuk migrasi ke domain `tsn.ponpes.id`.

---

## Prerequisites

✅ Domain `tsn.ponpes.id` sudah terdaftar  
✅ Akses ke DNS management  
✅ SSH access ke VPS (72.61.210.79)

---

## Step 1: Configure DNS (5 menit)

1. Login ke domain registrar Anda
2. Tambahkan **A Record**:
   - Type: `A`
   - Name: `@` (atau kosong)
   - Value: `72.61.210.79`
   - TTL: `3600`
3. Save dan tunggu 5-15 menit

**Verify:**
```powershell
nslookup tsn.ponpes.id
# Should return: 72.61.210.79
```

---

## Step 2: Run Migration Script on VPS (10 menit)

```bash
# SSH ke VPS
ssh user@72.61.210.79

# Navigate to project
cd /var/www/sistem-pondok

# Pull latest code (includes migration script)
git pull origin main

# Make script executable
chmod +x domain-migration.sh

# Run migration script
sudo bash domain-migration.sh
```

Script akan otomatis:
- ✅ Install Nginx
- ✅ Configure reverse proxy
- ✅ Obtain SSL certificate (Let's Encrypt)
- ✅ Update environment variables
- ✅ Restart application

---

## Step 3: Update Google OAuth (5 menit)

1. Buka: https://console.cloud.google.com/
2. Pilih project → **APIs & Services** → **Credentials**
3. Klik OAuth 2.0 Client ID
4. Tambahkan:
   - **Authorized JavaScript origins:** `https://tsn.ponpes.id`
   - **Authorized redirect URIs:** `https://tsn.ponpes.id/api/auth/callback/google`
5. **Save**

---

## Step 4: Test (2 menit)

1. Buka browser: https://tsn.ponpes.id
2. Check SSL certificate (🔒 green padlock)
3. Test login dengan Google OAuth
4. Test upload file
5. Test semua fitur

---

## Troubleshooting

### DNS belum resolve?
```bash
# Tunggu lebih lama atau flush DNS
ipconfig /flushdns  # Windows
```

### Nginx error?
```bash
# Check logs
sudo tail -f /var/log/nginx/tsn.ponpes.id.error.log
pm2 logs web
```

### OAuth error?
- Pastikan Google OAuth settings sudah update
- Clear browser cookies
- Restart app: `pm2 restart web`

---

## Total Time: ~20-30 menit

Untuk panduan lengkap, lihat: [DOMAIN-SETUP.md](./DOMAIN-SETUP.md)
