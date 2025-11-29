#!/bin/bash
# repair-vps.sh - Script untuk memperbaiki deployment secara total

echo "🛑 Menghentikan semua proses..."
pm2 delete all
pkill -f node

echo "🧹 Membersihkan cache dan build lama..."
rm -rf .next
rm -rf node_modules/.cache

echo "📥 Mengambil update terbaru..."
git reset --hard origin/main
git pull origin main

echo "📦 Menginstall dependencies..."
npm install

echo "🏗️ Membangun ulang aplikasi..."
npm run build

echo "📂 Menyiapkan file statis..."
cp -r public .next/standalone/
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

echo "🚀 Menjalankan server..."
pm2 start start-vps.sh --name "web"
pm2 save

echo "✅ Selesai! Silakan refresh browser (Ctrl + Shift + R)."
