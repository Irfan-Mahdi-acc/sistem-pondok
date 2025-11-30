# Panduan Downgrade Node.js ke v20 (LTS)

Untuk menyamakan versi Node.js dengan VPS (agar stabil dan kompatibel), kita akan menggunakan **NVM (Node Version Manager)**. Ini cara paling aman dan bersih.

## 1. Uninstall Node.js Lama (Opsional tapi Disarankan)

Agar tidak bentrok, sebaiknya uninstall versi Node.js yang sekarang (v24) dari:
*   **Settings** > **Apps** > **Installed Apps** > Cari "Node.js" > **Uninstall**.

## 2. Install NVM for Windows

1.  Download installer terbaru: **[nvm-setup.exe](https://github.com/coreybutler/nvm-windows/releases/download/1.1.12/nvm-setup.exe)**
2.  Jalankan `nvm-setup.exe`.
3.  Ikuti petunjuk instalasi (Next > Install > Finish).

## 3. Install Node.js v20

Buka **PowerShell** (Run as Administrator) dan jalankan perintah berikut satu per satu:

```powershell
# 1. Cek apakah nvm sudah terinstall
nvm version

# 2. Install Node.js versi 20 (LTS)
nvm install 20.18.0

# 3. Gunakan versi 20
nvm use 20.18.0

# 4. Verifikasi versi
node -v
# Harus muncul: v20.18.0
```

## 4. Install Ulang Global Packages

Setelah ganti versi Node, package global (seperti PM2) perlu diinstall ulang:

```powershell
npm install -g pm2
```

## 5. Re-install Dependencies Project

Kembali ke folder project Anda di VS Code terminal:

```powershell
# Hapus node_modules lama (agar bersih)
rm -r node_modules
rm package-lock.json

# Install ulang dependencies dengan Node v20
npm install

# Cek apakah jalan
npm run dev
```
