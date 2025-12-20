# Fix Image Upload di VPS

## Masalah

Setelah deploy ke VPS, upload image gagal dengan error:
```
The requested resource isn't a valid image for /uploads/[filename].png received null
```

**Penyebab:**
Next.js dengan `output: 'standalone'` tidak otomatis copy folder `public` ke `.next/standalone`. File yang di-upload tidak bisa diakses.

---

## Solusi Quick Fix

Jalankan command ini di VPS:

```bash
# 1. Navigate ke project
cd /var/www/sistem-pondok

# 2. Copy public folder ke standalone build
cp -r public .next/standalone/

# 3. Buat uploads directory dengan permissions yang benar
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# 4. Restart PM2
pm2 restart web

# 5. Verify
pm2 logs web
```

---

## Solusi Permanent (Recommended)

### Option 1: Gunakan Startup Script

1. **Upload file `start-vps.sh` ke VPS:**
   ```bash
   # Di terminal lokal
   scp start-vps.sh root@72.61.210.79:/var/www/sistem-pondok/
   ```

2. **Set permissions:**
   ```bash
   # Di VPS
   cd /var/www/sistem-pondok
   chmod +x start-vps.sh
   ```

3. **Update PM2 config:**
   ```bash
   # Stop process lama
   pm2 delete web
   
   # Start dengan script baru
   pm2 start start-vps.sh --name "web"
   
   # Save config
   pm2 save
   ```

### Option 2: Symlink (Alternative)

```bash
cd /var/www/sistem-pondok

# Create symlink dari standalone ke root public
ln -s /var/www/sistem-pondok/public .next/standalone/public

# Ensure uploads exists
mkdir -p public/uploads
chmod -R 755 public/uploads

# Restart
pm2 restart web
```

---

## Verification

1. **Test upload:**
   - Buka aplikasi
   - Tambah Lembaga baru
   - Upload logo
   - Verify logo muncul

2. **Check file location:**
   ```bash
   # Cek file ada di standalone
   ls -la /var/www/sistem-pondok/.next/standalone/public/uploads/
   ```

3. **Check logs:**
   ```bash
   pm2 logs web --lines 50
   ```

---

## Troubleshooting

### Upload berhasil tapi gambar tidak muncul

```bash
# Verify permissions
ls -la .next/standalone/public/uploads/

# Fix permissions jika perlu
chmod -R 755 .next/standalone/public/uploads/
```

### Error "ENOENT: no such file or directory"

```bash
# Pastikan folder exists
mkdir -p .next/standalone/public/uploads

# Copy public folder lagi
cp -r public .next/standalone/

# Restart
pm2 restart web
```

### Setelah rebuild, upload error lagi

Setiap kali `npm run build`, Anda harus copy public folder lagi:

```bash
npm run build
cp -r public .next/standalone/
pm2 restart web
```

**Solusi:** Gunakan startup script (`start-vps.sh`) yang otomatis handle ini.

---

## Update DEPLOYMENT.md

Tambahkan step ini ke deployment workflow:

```bash
# Setelah npm run build
npm run build

# Copy public folder
cp -r public .next/standalone/
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# Restart
pm2 restart web
```
