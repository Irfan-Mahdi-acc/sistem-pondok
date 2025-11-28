# Instruksi Update Database

Fitur approval user baru memerlukan update pada database. Silakan jalankan perintah berikut di terminal:

## 1. Update Schema Database

```bash
npx prisma migrate dev --name add_user_approval_fields
```

Jika perintah di atas gagal karena masalah koneksi, coba gunakan:

```bash
npx prisma db push
```

## 2. Generate Prisma Client

Setelah migration berhasil, jalankan:

```bash
npx prisma generate
```

## 3. Restart Server

Matikan server (`Ctrl+C`) lalu jalankan kembali:

```bash
npm run dev
```

---

## Fitur Baru:

1. **User Approval System**
   - User baru (Google/Web) statusnya `PENDING` dan `isApproved: false`
   - User akan diarahkan ke halaman "Menunggu Persetujuan" saat login
   - Admin dapat menyetujui user di menu dashboard

2. **Admin Dashboard**
   - Menu "Pendaftaran Akun (Web)" untuk pendaftaran via form website
   - Menu "Pendaftaran Akun (Google)" untuk pendaftaran via Google Sign In

3. **Google OAuth**
   - Login dan Register menggunakan akun Google
   - Auto-link dengan akun yang sudah ada (jika email sama)
