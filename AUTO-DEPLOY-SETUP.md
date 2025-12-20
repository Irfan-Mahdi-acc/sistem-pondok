# GitHub Actions Auto-Deploy Setup Guide

## 📋 Overview

Automated deployment system untuk **siakad-tsn-ponpes** menggunakan GitHub Actions.

**Repository:** [Irfan-Mahdi-acc/siakad-tsn-ponpes](https://github.com/Irfan-Mahdi-acc/siakad-tsn-ponpes)  
**Domain:** https://siakad.tsn.ponpes.id  
**VPS:** 72.62.120.242:2222

---

## 🚀 Quick Start

### 1. Setup GitHub Secrets

Buka repository settings di GitHub:
```
https://github.com/Irfan-Mahdi-acc/siakad-tsn-ponpes/settings/secrets/actions
```

Tambahkan secrets berikut:

| Secret Name | Value | Required |
|-------------|-------|----------|
| `VPS_HOST` | `72.62.120.242` | ✅ Yes |
| `VPS_USER` | `deploy` | ✅ Yes |
| `VPS_PORT` | `2222` | ✅ Yes |
| `SSH_PRIVATE_KEY` | (Your SSH private key) | ✅ Yes |
| `TELEGRAM_BOT_TOKEN` | (Your bot token) | ⚠️ Optional |
| `TELEGRAM_CHAT_ID` | (Your chat ID) | ⚠️ Optional |

---

## 🔑 Generate SSH Key (Jika Belum Ada)

### Di Local Machine (Windows PowerShell):

```powershell
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-siakad-tsn" -f ~/.ssh/siakad_deploy

# Copy public key
Get-Content ~/.ssh/siakad_deploy.pub | clip
```

### Di VPS:

```bash
# SSH ke VPS
ssh -p 2222 deploy@72.62.120.242

# Add public key to authorized_keys
nano ~/.ssh/authorized_keys
# Paste public key, save and exit

# Set permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Di GitHub:

```powershell
# Copy private key
Get-Content ~/.ssh/siakad_deploy | clip
```

Paste ke GitHub Secret `SSH_PRIVATE_KEY`

---

## 📦 Deployment Workflow

### Automatic Deployment

```bash
# Push to main branch triggers auto-deploy
git add .
git commit -m "feat: your changes"
git push origin main
```

GitHub Actions akan otomatis:
1. ✅ Pull latest code ke VPS
2. ✅ Install dependencies
3. ✅ Run database migrations
4. ✅ Build application
5. ✅ Restart PM2
6. ✅ Health check
7. ✅ Send notification (jika configured)

### Manual Deployment

```bash
# SSH ke VPS
ssh -p 2222 deploy@72.62.120.242

# Navigate to app
cd /var/www/siakad.tsn.ponpes.id

# Pull changes
git pull origin main

# Install dependencies
npm ci

# Run migrations
npx prisma migrate deploy

# Build
npm run build

# Copy static files
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Restart PM2
pm2 restart siakad-tsn
```

---

## 📊 Monitoring

### Check Deployment Status

**GitHub Actions:**
```
https://github.com/Irfan-Mahdi-acc/siakad-tsn-ponpes/actions
```

**VPS:**
```bash
# SSH to VPS
ssh -p 2222 deploy@72.62.120.242

# Check PM2 status
pm2 status

# View logs
pm2 logs siakad-tsn --lines 50

# Monitor in real-time
pm2 monit
```

### Health Check

```bash
# Check application
curl https://siakad.tsn.ponpes.id

# Check PM2
pm2 status siakad-tsn

# Check Nginx
sudo systemctl status nginx

# Check database
psql -U deploy -d siakad_db -c "SELECT version();"
```

---

## 🔧 Troubleshooting

### Deployment Failed

**1. Check GitHub Actions Logs:**
```
https://github.com/Irfan-Mahdi-acc/siakad-tsn-ponpes/actions
```

**2. Check PM2 Logs:**
```bash
ssh -p 2222 deploy@72.62.120.242
pm2 logs siakad-tsn --lines 100 --err
```

**3. Check Application:**
```bash
cd /var/www/siakad.tsn.ponpes.id
npm run build  # Test build locally
```

### SSH Connection Failed

**Check SSH Key:**
```bash
# Test SSH connection
ssh -p 2222 -i ~/.ssh/siakad_deploy deploy@72.62.120.242

# Verify key in GitHub Secrets
# Make sure SSH_PRIVATE_KEY includes:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

### Build Failed

**Common issues:**
```bash
# Clear node_modules and rebuild
rm -rf node_modules .next
npm install
npm run build

# Check Prisma
npx prisma generate
npx prisma migrate deploy

# Check environment variables
cat .env
```

### PM2 Not Starting

```bash
# Check PM2 status
pm2 status

# Delete and restart
pm2 delete siakad-tsn
pm2 start ecosystem.config.js

# Check logs
pm2 logs siakad-tsn
```

---

## 📱 Telegram Notifications (Optional)

### 1. Create Telegram Bot

1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Follow instructions
4. Copy bot token

### 2. Get Chat ID

1. Send message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find `"chat":{"id":...}`
4. Copy chat ID

### 3. Add to GitHub Secrets

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

---

## 📝 Files Created

### `.github/workflows/deploy.yml`
GitHub Actions workflow untuk auto-deployment

### `ecosystem.config.js`
PM2 configuration untuk production

---

## ✅ Verification Checklist

- [ ] GitHub Secrets configured
- [ ] SSH key added to VPS
- [ ] `.github/workflows/deploy.yml` committed
- [ ] `ecosystem.config.js` updated
- [ ] First deployment successful
- [ ] Application accessible at https://siakad.tsn.ponpes.id
- [ ] PM2 running with 2 instances
- [ ] Telegram notifications working (if configured)

---

## 🔗 Related Documentation

- [PROJECT-RULES.md](../PROJECT-RULES.md) - VPS Deployment section
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Complete deployment guide
- [SECURITY-HARDENING.md](../SECURITY-HARDENING.md) - Security best practices

---

**Last Updated:** December 20, 2025  
**Version:** 1.0.0
