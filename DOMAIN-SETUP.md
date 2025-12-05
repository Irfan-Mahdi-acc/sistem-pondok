# Domain Setup Guide: tsn.ponpes.id

Panduan lengkap untuk mengkonfigurasi domain `tsn.ponpes.id` dengan SSL/HTTPS.

---

## 📋 Prerequisites

- ✅ Domain `tsn.ponpes.id` sudah terdaftar
- ✅ Akses ke DNS management domain
- ✅ SSH access ke VPS (72.61.210.79)
- ✅ VPS sudah running aplikasi Next.js

---

## Step 1: Konfigurasi DNS

### 1.1 Login ke Domain Registrar

Login ke panel kontrol tempat Anda mendaftarkan domain `tsn.ponpes.id`.

### 1.2 Tambahkan A Record

Buat DNS record baru:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 72.61.210.79 | 3600 |

> **Note:** 
> - `@` atau kosong = root domain (tsn.ponpes.id)
> - Jika ingin subdomain (www.tsn.ponpes.id), gunakan `www` sebagai Name

### 1.3 Verifikasi DNS Propagation

Tunggu beberapa menit, lalu test dari komputer lokal:

```bash
# Windows PowerShell
nslookup tsn.ponpes.id

# Atau test ping
ping tsn.ponpes.id
```

**Expected Output:**
```
Name:    tsn.ponpes.id
Address: 72.61.210.79
```

> [!TIP]
> DNS propagation bisa memakan waktu 5 menit - 48 jam. Biasanya 5-15 menit sudah cukup.

---

## Step 2: Install Nginx (Reverse Proxy)

SSH ke VPS dan install Nginx:

```bash
# SSH ke VPS
ssh user@72.61.210.79

# Update package list
sudo apt update

# Install Nginx
sudo apt install nginx -y

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## Step 3: Konfigurasi Nginx untuk Next.js

### 3.1 Buat File Konfigurasi

```bash
sudo nano /etc/nginx/sites-available/tsn.ponpes.id
```

### 3.2 Paste Konfigurasi Berikut

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tsn.ponpes.id www.tsn.ponpes.id;

    # Increase client body size for file uploads
    client_max_body_size 10M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.3 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/tsn.ponpes.id /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3.4 Test HTTP Access

Buka browser dan akses: `http://tsn.ponpes.id`

Aplikasi seharusnya sudah bisa diakses (tapi masih HTTP, belum HTTPS).

---

## Step 4: Install SSL Certificate (Let's Encrypt)

### 4.1 Install Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 4.2 Obtain SSL Certificate

```bash
# Obtain and install certificate
sudo certbot --nginx -d tsn.ponpes.id -d www.tsn.ponpes.id
```

**Certbot akan bertanya:**

1. **Email address:** Masukkan email Anda (untuk renewal notifications)
2. **Terms of Service:** Ketik `Y` untuk agree
3. **Share email:** Ketik `N` (optional)
4. **Redirect HTTP to HTTPS:** Ketik `2` (Redirect - recommended)

### 4.3 Verify Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run
```

Jika sukses, certificate akan auto-renew setiap 90 hari.

---

## Step 5: Update Application Configuration

### 5.1 Update Environment Variables

```bash
cd /var/www/sistem-pondok
nano .env
```

Update nilai berikut:

```env
# Change from:
NEXTAUTH_URL=http://72.61.210.79:3000

# To:
NEXTAUTH_URL=https://tsn.ponpes.id
NEXTAUTH_URL_INTERNAL=http://localhost:3000
```

### 5.2 Restart Application

```bash
pm2 restart web
pm2 save
```

---

## Step 6: Update Google OAuth Settings

> [!WARNING]
> **PENTING:** Jika tidak update Google OAuth, login tidak akan berfungsi!

### 6.1 Login ke Google Cloud Console

1. Buka: https://console.cloud.google.com/
2. Pilih project Anda
3. Navigate to: **APIs & Services** → **Credentials**

### 6.2 Update OAuth 2.0 Client

Klik OAuth 2.0 Client ID Anda, lalu update:

**Authorized JavaScript origins:**
```
https://tsn.ponpes.id
```

**Authorized redirect URIs:**
```
https://tsn.ponpes.id/api/auth/callback/google
```

> [!TIP]
> Anda bisa tetap menyimpan URL lama (IP) untuk backup, jadi ada 2 URL di list.

### 6.3 Save Changes

Klik **Save** di Google Cloud Console.

---

## Step 7: Verification

### 7.1 Test HTTPS Access

```bash
# Test dari VPS
curl -I https://tsn.ponpes.id

# Should return: HTTP/2 200
```

### 7.2 Test di Browser

1. **Akses domain:** https://tsn.ponpes.id
2. **Check SSL:** Harus ada ikon gembok hijau 🔒
3. **Test login:** Login dengan Google OAuth
4. **Test features:**
   - Create/edit data
   - Upload file
   - Generate PDF
   - Semua fitur harus berfungsi normal

### 7.3 Check Certificate Details

Klik ikon gembok di browser → Certificate → Details

**Expected:**
- Issued by: Let's Encrypt
- Valid for: tsn.ponpes.id
- Expires: ~90 days from now

---

## Troubleshooting

### Issue 1: DNS Not Resolving

**Problem:** `nslookup tsn.ponpes.id` tidak return IP yang benar

**Solution:**
1. Check DNS settings di domain registrar
2. Tunggu lebih lama (DNS propagation)
3. Flush DNS cache:
   ```powershell
   # Windows
   ipconfig /flushdns
   ```

### Issue 2: Nginx 502 Bad Gateway

**Problem:** Nginx error 502

**Solution:**
```bash
# Check if Next.js is running
pm2 status

# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000

# Restart Next.js
pm2 restart web

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Issue 3: SSL Certificate Failed

**Problem:** Certbot gagal obtain certificate

**Solution:**
1. Pastikan domain sudah pointing ke IP (check DNS)
2. Pastikan port 80 terbuka:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   ```
3. Pastikan Nginx running:
   ```bash
   sudo systemctl status nginx
   ```

### Issue 4: OAuth Login Failed

**Problem:** Error saat login dengan Google

**Solution:**
1. Verify `NEXTAUTH_URL` di `.env` sudah benar
2. Verify Google OAuth settings sudah update
3. Clear browser cookies
4. Restart application:
   ```bash
   pm2 restart web
   ```

### Issue 5: Mixed Content Warning

**Problem:** Browser warning tentang mixed content (HTTP/HTTPS)

**Solution:**
1. Check semua URL di code menggunakan relative paths
2. Verify `NEXTAUTH_URL` menggunakan `https://`
3. Check browser console untuk URL yang masih HTTP

---

## Firewall Configuration

Pastikan firewall mengizinkan traffic:

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (jangan lupa!)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Maintenance

### Renew SSL Certificate (Manual)

```bash
# Renew all certificates
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

### Check Certificate Expiry

```bash
# Check expiry date
sudo certbot certificates
```

### Update Nginx Configuration

```bash
# Edit config
sudo nano /etc/nginx/sites-available/tsn.ponpes.id

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Test DNS | `nslookup tsn.ponpes.id` |
| Test HTTPS | `curl -I https://tsn.ponpes.id` |
| Restart Nginx | `sudo systemctl restart nginx` |
| Restart App | `pm2 restart web` |
| View Nginx logs | `sudo tail -f /var/log/nginx/error.log` |
| View App logs | `pm2 logs web` |
| Renew SSL | `sudo certbot renew` |
| Check SSL expiry | `sudo certbot certificates` |

---

## Summary Checklist

- [ ] DNS A record configured
- [ ] DNS resolving correctly (`nslookup`)
- [ ] Nginx installed and running
- [ ] Nginx config created and enabled
- [ ] HTTP access working (`http://tsn.ponpes.id`)
- [ ] SSL certificate obtained
- [ ] HTTPS access working (`https://tsn.ponpes.id`)
- [ ] `.env` updated with new domain
- [ ] Google OAuth settings updated
- [ ] Application restarted
- [ ] Login tested and working
- [ ] All features tested
- [ ] Firewall configured

---

## Next Steps

After successful migration:

1. **Update documentation:** Update any docs that reference the old IP
2. **Notify users:** If you have existing users, notify them of the new URL
3. **Monitor logs:** Keep an eye on logs for any issues
4. **Setup monitoring:** Consider setting up uptime monitoring
5. **Backup:** Make sure you have recent backups

---

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
