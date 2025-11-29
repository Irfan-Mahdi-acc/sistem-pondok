# Quick Deployment Guide - VPS

Panduan cepat untuk deploy aplikasi Next.js ke VPS Hostinger.

---

## 📋 Prerequisites

Pastikan sudah terinstall di VPS:
- ✅ Node.js v18+ (`node --version`)
- ✅ PostgreSQL v14+ (`psql --version`)
- ✅ PM2 (`pm2 --version`)
- ✅ Git (`git --version`)

---

## 🚀 Deployment Steps

### Step 1: Clone Repository (First Time Only)

```bash
# SSH ke VPS
ssh user@YOUR_VPS_IP

# Navigate ke direktori web
cd /var/www

# Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git sistem-pondok
cd sistem-pondok
```

### Step 2: Setup Environment Variables

```bash
# Copy template
cp env.production.template .env

# Edit file .env
nano .env
```

**Isi dengan nilai berikut:**

```env
# Node Environment
NODE_ENV=production

# Database (ganti dengan kredensial PostgreSQL Anda)
DATABASE_URL="postgresql://pondok_user:PASSWORD_ANDA@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://pondok_user:PASSWORD_ANDA@localhost:5432/sistem_pondok"

# NextAuth (generate secret baru)
NEXTAUTH_SECRET="PASTE_HASIL_COMMAND_DIBAWAH"
NEXTAUTH_URL="http://YOUR_VPS_IP:3000"

# Encryption (generate key baru)
ENCRYPTION_KEY="PASTE_HASIL_COMMAND_DIBAWAH"

# Security
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30

# Server
PORT=3000
HOSTNAME=0.0.0.0
```

**Generate secrets:**

```bash
# Generate NEXTAUTH_SECRET (copy hasilnya)
openssl rand -base64 32

# Generate ENCRYPTION_KEY (copy hasilnya)
openssl rand -hex 16
```

Paste hasil generate ke file `.env` di bagian yang sesuai.

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Setup Database

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Step 5: Build Application

```bash
npm run build
```

### Step 6: Copy Static Files

```bash
# Copy public folder
cp -r public .next/standalone/

# Create uploads directory
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads
```

### Step 7: Start with PM2

```bash
# Start application
npm run pm2:start

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
# Copy dan jalankan command yang muncul
```

### Step 8: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs web --lines 20

# Test di browser
# Buka: http://YOUR_VPS_IP:3000
```

---

## 🔄 Update/Redeploy (Deployment Berikutnya)

Setelah push changes ke Git:

```bash
# SSH ke VPS
ssh user@YOUR_VPS_IP
cd /var/www/sistem-pondok

# Run deployment script
./deploy-vps.sh
```

**Atau manual:**

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Build
npm run build

# Copy static files
cp -r public .next/standalone/
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# Restart PM2
npm run pm2:restart
```

---

## 📊 PM2 Management Commands

```bash
# View status
pm2 status

# View logs (real-time)
pm2 logs web

# View last 100 lines
pm2 logs web --lines 100

# Monitor resources
pm2 monit

# Restart application
pm2 restart web

# Stop application
pm2 stop web

# Delete process
pm2 delete web
```

---

## 🔧 Troubleshooting

### Build Error: Out of Memory

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Database Connection Failed

```bash
# Check PostgreSQL running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Test connection
psql -U pondok_user -d sistem_pondok
```

### PM2 Process Not Found

```bash
# List all processes
pm2 list

# Start new process
npm run pm2:start
pm2 save
```

### Application Keeps Restarting

```bash
# Check logs for errors
pm2 logs web --lines 50

# Common issues:
# - Port 3000 already in use
# - Database connection failed
# - Missing environment variables
```

### File Upload Not Working

```bash
# Ensure uploads directory exists
mkdir -p public/uploads
mkdir -p .next/standalone/public/uploads
chmod -R 755 public/uploads
chmod -R 755 .next/standalone/public/uploads
```

### Git Authentication Required

**Option 1: SSH Key (Recommended)**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# View public key
cat ~/.ssh/id_ed25519.pub

# Copy output dan tambahkan ke GitHub:
# GitHub → Settings → SSH and GPG keys → New SSH key

# Test connection
ssh -T git@github.com

# Change remote to SSH
git remote set-url origin git@github.com:USERNAME/REPO.git
```

**Option 2: Personal Access Token**
```bash
# Generate token di GitHub:
# Settings → Developer settings → Personal access tokens → Generate new token

# Saat git pull, paste token sebagai password
```

---

## 🔒 Security Checklist

- ✅ `.env` file tidak di-commit ke Git
- ✅ Strong database password
- ✅ `NODE_ENV=production` set
- ✅ Firewall configured (ufw)
- ✅ Regular backups
- ✅ SSL/TLS (optional, tapi recommended)

**Setup Firewall:**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Application
sudo ufw enable
```

---

## 📈 Performance Tips

### 1. Enable Cluster Mode

Edit `ecosystem.config.js`:
```javascript
instances: 2,  // Sesuaikan dengan jumlah CPU cores
```

Restart:
```bash
pm2 restart ecosystem.config.js
```

### 2. Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Database Backup

```bash
# Backup database
pg_dump sistem_pondok > backup_$(date +%Y%m%d).sql

# Restore database
psql sistem_pondok < backup_20251129.sql
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Deploy | `./deploy-vps.sh` |
| Check Status | `pm2 status` |
| View Logs | `pm2 logs web` |
| Restart | `pm2 restart web` |
| Monitor | `pm2 monit` |
| Database Migrate | `npx prisma migrate deploy` |
| Build | `npm run build` |

---

## 📚 Additional Documentation

- **Comprehensive Guide**: [VPS-OPTIMIZATION-GUIDE.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/VPS-OPTIMIZATION-GUIDE.md)
- **Detailed Deployment**: [DEPLOYMENT.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/DEPLOYMENT.md)
- **Environment Setup**: [VPS-ENV-TEMPLATE.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/VPS-ENV-TEMPLATE.md)
- **Database Migration**: [DATABASE_MIGRATION.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/DATABASE_MIGRATION.md)

---

## ✅ Deployment Checklist

**Before Deployment:**
- [ ] Code tested locally
- [ ] Database migrations ready
- [ ] Environment variables prepared
- [ ] Secrets generated

**During Deployment:**
- [ ] Git pull successful
- [ ] Dependencies installed
- [ ] Database migrated
- [ ] Build successful
- [ ] Static files copied
- [ ] PM2 started

**After Deployment:**
- [ ] PM2 status shows "online"
- [ ] Application accessible via browser
- [ ] Login works
- [ ] File upload works
- [ ] No errors in logs

---

**Need Help?** Check [VPS-OPTIMIZATION-GUIDE.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/VPS-OPTIMIZATION-GUIDE.md) untuk troubleshooting lengkap.
