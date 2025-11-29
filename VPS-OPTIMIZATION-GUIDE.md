# VPS Optimization Guide

Panduan lengkap untuk mengoptimalkan dan men-deploy aplikasi Next.js 16 ke VPS.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Process](#deployment-process)
- [PM2 Management](#pm2-management)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)

---

## Prerequisites

### Software Requirements
- **Node.js**: v18 atau lebih baru
- **PostgreSQL**: v14 atau lebih baru
- **PM2**: Process manager untuk Node.js
- **Git**: Version control

### Install PM2 (jika belum)
```bash
npm install -g pm2
```

---

## Environment Setup

### 1. Copy Environment Template
```bash
cp env.production.template .env
```

### 2. Configure Environment Variables

Edit file `.env` dan isi dengan nilai yang sesuai:

```bash
# Node Environment
NODE_ENV=production

# Database (sesuaikan dengan konfigurasi PostgreSQL Anda)
DATABASE_URL="postgresql://pondok_user:YOUR_PASSWORD@localhost:5432/sistem_pondok"
DIRECT_URL="postgresql://pondok_user:YOUR_PASSWORD@localhost:5432/sistem_pondok"

# NextAuth (PENTING!)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://YOUR_VPS_IP:3000"  # atau domain Anda

# Encryption
ENCRYPTION_KEY="$(openssl rand -hex 16)"

# Security
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=30

# Server
PORT=3000
HOSTNAME=0.0.0.0
```

### 3. Generate Secret Keys

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 16
```

---

## Deployment Process

### Method 1: Using Deployment Script (Recommended)

```bash
# Make script executable
chmod +x deploy-vps.sh

# Run deployment
./deploy-vps.sh
```

Script ini akan otomatis:
- Pull latest code dari Git
- Install dependencies
- Run database migrations
- Build aplikasi
- Copy static files
- Restart PM2

### Method 2: Manual Deployment

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
npm install

# 3. Run migrations
npx prisma migrate deploy
npx prisma generate

# 4. Build application
npm run build

# 5. Copy static files
cp -r public .next/standalone/
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# 6. Restart with PM2
npm run pm2:restart
```

---

## PM2 Management

### Start Application
```bash
npm run pm2:start
# atau
pm2 start ecosystem.config.js
```

### Restart Application
```bash
npm run pm2:restart
# atau
pm2 restart web
```

### Stop Application
```bash
npm run pm2:stop
# atau
pm2 stop web
```

### View Logs
```bash
npm run pm2:logs
# atau
pm2 logs web

# View last 100 lines
pm2 logs web --lines 100
```

### Monitor Application
```bash
npm run pm2:monit
# atau
pm2 monit
```

### Check Status
```bash
pm2 status
```

### Save PM2 Configuration
```bash
pm2 save
```

### Setup PM2 Startup (Auto-start on reboot)
```bash
pm2 startup
# Follow the instructions shown
pm2 save
```

---

## Troubleshooting

### Build Errors

**Error: Out of memory**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Error: Prisma client not generated**
```bash
npx prisma generate
npm run build
```

### Database Connection Errors

**Error: Connection refused**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if stopped
sudo systemctl start postgresql

# Check connection
psql -U pondok_user -d sistem_pondok -h localhost
```

**Error: Authentication failed**
- Verify username and password in `.env`
- Check PostgreSQL user permissions
- Verify `pg_hba.conf` allows local connections

### Authentication Issues

**Error: Redirect loop**
- Verify `NEXTAUTH_URL` matches your actual URL
- Check `NEXTAUTH_SECRET` is set and at least 32 characters
- Clear browser cookies and try again

**Error: Session not persisting**
- Verify cookies are enabled
- Check `NODE_ENV=production` is set
- Verify `NEXTAUTH_URL` uses correct protocol (http/https)

### File Upload Errors

**Error: Failed to upload file**
```bash
# Ensure uploads directory exists with correct permissions
mkdir -p public/uploads
chmod -R 755 public/uploads

# For standalone build
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads
```

### PM2 Issues

**Error: Process not found**
```bash
# List all processes
pm2 list

# If no process, start new one
npm run pm2:start
```

**Application keeps restarting**
```bash
# Check logs for errors
pm2 logs web --lines 50

# Common causes:
# - Port already in use
# - Database connection failed
# - Missing environment variables
```

---

## Performance Optimization

### 1. Enable Compression
Already enabled in `next.config.ts`:
```typescript
compress: true
```

### 2. Database Connection Pooling
Prisma automatically handles connection pooling. Monitor with:
```bash
pm2 monit
```

### 3. PM2 Cluster Mode
Edit `ecosystem.config.js`:
```javascript
instances: 2,  // Change from 1 to number of CPU cores
exec_mode: 'cluster'
```

### 4. Memory Management
Monitor memory usage:
```bash
pm2 monit
```

If memory usage is high, adjust in `ecosystem.config.js`:
```javascript
max_memory_restart: '512M'  // Adjust as needed
```

### 5. Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use strong, random secrets
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/prod

### 2. Database Security
```bash
# Use strong passwords
# Limit PostgreSQL to local connections only
# Regular backups
pg_dump sistem_pondok > backup_$(date +%Y%m%d).sql
```

### 3. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Application (or use reverse proxy)
sudo ufw enable
```

### 4. SSL/TLS (Recommended)
Use reverse proxy (Nginx) with Let's Encrypt:
```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 5. Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node.js dependencies
npm audit
npm audit fix
```

### 6. Security Headers
Already configured in `next.config.ts`:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- X-DNS-Prefetch-Control

---

## Monitoring & Maintenance

### Daily Checks
```bash
# Check application status
pm2 status

# Check recent logs
pm2 logs web --lines 20 --nostream
```

### Weekly Maintenance
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Rotate logs if needed
pm2 flush
```

### Monthly Tasks
- Review and update dependencies
- Database backup
- Security audit
- Performance review

---

## Quick Reference Commands

```bash
# Deployment
./deploy-vps.sh

# PM2 Management
pm2 start ecosystem.config.js
pm2 restart web
pm2 stop web
pm2 logs web
pm2 monit
pm2 status

# Database
npx prisma migrate deploy
npx prisma generate
npx prisma studio  # Database GUI

# Build
npm run build
npm run start:production

# Logs
pm2 logs web --lines 100
journalctl -u postgresql -n 50
```

---

## Support & Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **PM2 Documentation**: https://pm2.keymetrics.io/docs
- **NextAuth Documentation**: https://next-auth.js.org

---

## Changelog

### 2025-11-29
- Initial VPS optimization guide
- Added PM2 ecosystem configuration
- Enhanced Next.js config with security headers
- Fixed authentication redirect issues
- Created automated deployment script
