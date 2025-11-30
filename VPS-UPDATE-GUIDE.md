# Panduan Update VPS

Berikut adalah langkah-langkah untuk mengambil perubahan terbaru (pull) dan mengupdate aplikasi di VPS Anda.

## 1. Login ke VPS
Masuk ke VPS Anda menggunakan SSH (ganti `username` dan `ip_address` sesuai milik Anda):
```bash
ssh root@<IP_ADDRESS_VPS_ANDA>
```

## 2. Masuk ke Direktori Project
Navigasi ke folder project Anda (sesuaikan path jika berbeda):
```bash
cd /var/www/sistem-pondok
```
*(Catatan: Sesuaikan path `/var/www/sistem-pondok` dengan lokasi project Anda yang sebenarnya di VPS)*

## 3. Pull Perubahan Terbaru
Ambil code terbaru dari GitHub:
```bash
git pull origin main
```

## 4. Install Dependencies (Jika ada perubahan package)
Karena ada perubahan pada `package.json`, jalankan perintah ini untuk memastikan semua library terinstall:
```bash
npm install
```

## 5. Generate Prisma Client (Opsional tapi disarankan)
Untuk memastikan database client sinkron:
```bash
npx prisma generate
```

## 6. Build Aplikasi
Build ulang aplikasi Next.js untuk menerapkan perubahan di production:
```bash
npm run build
```

## 7. Restart Server
Restart aplikasi menggunakan PM2 agar perubahan diterapkan:
```bash
pm2 restart web
```
*(Atau gunakan nama process/id yang sesuai jika bukan `web`)*

## Ringkasan Perintah (One-Liner)
Jika Anda ingin menjalankan semuanya sekaligus (setelah masuk ke folder project):
```bash
git pull origin main && npm install && npx prisma generate && npm run build && pm2 restart web
```
