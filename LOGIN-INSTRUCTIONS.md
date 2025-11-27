# 🔐 Instruksi Login - PENTING!

## ⚠️ GUNAKAN LOCALHOST, BUKAN 0.0.0.0

**URL yang BENAR:**
- ✅ http://localhost:3000
- ✅ http://127.0.0.1:3000

**URL yang SALAH (tidak akan berfungsi di browser):**
- ❌ http://0.0.0.0:3000

## 📝 Langkah-Langkah Login:

### 1. Clear Browser Cookies

**Chrome/Edge:**
1. Tekan `Ctrl + Shift + Delete`
2. Pilih "Cookies and other site data"
3. Pilih "Last hour" atau "All time"
4. Klik "Clear data"

**Atau lebih cepat:**
1. F12 (DevTools)
2. Tab "Application"
3. Storage → Cookies → http://localhost:3000
4. Klik "Clear all"

### 2. Buka URL yang Benar

```
http://localhost:3000/login
```

**JANGAN gunakan:**
- http://0.0.0.0:3000 ❌

### 3. Login dengan Credentials

```
Username: irfanmahdi.dev@gmail.com
Password: SuperAdmin2024!
```

### 4. Pilih Role

Setelah login berhasil, Anda akan ke halaman **Select Role**:
- Pilih **SUPER_ADMIN** untuk full access
- Klik tombol role tersebut

### 5. Masuk Dashboard

Sekarang Anda akan masuk ke dashboard dengan sukses! ✅

## 🐛 Troubleshooting

### Problem: "This site can't be reached" di 0.0.0.0
**Solution:** Gunakan `localhost:3000` atau `127.0.0.1:3000`

### Problem: Stuck di halaman select-role setelah pilih role
**Solution:** 
1. Clear browser cookies
2. Restart browser
3. Login ulang menggunakan `localhost:3000`

### Problem: Error "MissingCSRF"
**Solution:**
1. Clear cookies
2. Hard refresh (Ctrl + Shift + R)
3. Login ulang

## 🎯 Quick Commands

```bash
# Cek server status
netstat -ano | findstr :3000

# Restart dev server (jika perlu)
Ctrl + C (di terminal yang running npm run dev)
npm run dev
```

## ✅ Checklist

- [ ] Clear browser cookies
- [ ] Gunakan http://localhost:3000 (BUKAN 0.0.0.0)
- [ ] Login dengan credentials yang benar
- [ ] Pilih role SUPER_ADMIN
- [ ] Masuk dashboard

## 📌 Notes

- Cookie `selected-role` sekarang sudah di-fix dengan `path: '/'`
- User roles sudah updated: `["SUPER_ADMIN", "ADMIN"]`
- Server running di: http://localhost:3000

