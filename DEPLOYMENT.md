# Deployment Guide for VPS

Follow these steps to deploy your latest changes to the VPS.

## Prerequisites
- SSH access to your VPS.
- Git installed on the VPS.
- Node.js and npm installed on the VPS.
- PostgreSQL running and accessible.
- PM2 installed globally (`npm install -g pm2`)

---

## Quick Deployment (Recommended)

### Using Automated Deployment Script

```bash
# SSH into VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /var/www/sistem-pondok

# Run deployment script
./deploy-vps.sh
```

The script will automatically:
1. Pull latest changes from Git
2. Install dependencies
3. Run database migrations
4. Build the application
5. **Copy static files** (critical for standalone mode!)
6. Restart PM2 process
7. Run health check

---

## ⚠️ Important: Next.js Standalone Mode

This project uses Next.js `output: 'standalone'` mode for optimized production builds.

### What This Means

When building with standalone mode:
- ✅ Server code is bundled into `.next/standalone/`
- ❌ Static assets (`_next/static/`) are **NOT** automatically included
- ❌ Public files (`public/`) are **NOT** automatically included

### Critical Requirement

**You MUST manually copy static files after building:**

```bash
# After npm run build, always run:
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

**If you skip this step, you will get:**
- 404 errors for JavaScript chunks
- MIME type errors
- Application won't load properly

### Automated Script Handles This

The `deploy-vps.sh` script automatically copies these files. If deploying manually, don't forget this step!

---

## Manual Deployment Steps

### 1. Push Changes to Git
On your local machine, commit and push your changes:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### 2. Connect to VPS
SSH into your server:
```bash
ssh user@your-vps-ip
```

### 3. Navigate to Project Directory
```bash
cd /var/www/sistem-pondok
```

### 4. Pull Latest Changes
```bash
git pull origin main
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Run Database Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### 7. Build Application
```bash
npm run build
```

### 8. Copy Static Files (CRITICAL!)

> **⚠️ WARNING:** This step is REQUIRED for standalone builds. Skipping it will cause 404 errors!

```bash
# Copy static assets to standalone build
cp -r .next/static .next/standalone/.next/

# Copy public folder to standalone build
cp -r public .next/standalone/

# Ensure uploads directory exists with proper permissions
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# Verify files were copied successfully
ls -la .next/standalone/.next/static/
ls -la .next/standalone/public/
```

### 9. Restart Application

**Using PM2 Ecosystem Config (Recommended):**
```bash
npm run pm2:restart
# or
pm2 restart ecosystem.config.js --update-env
```

**First Time Setup:**
```bash
npm run pm2:start
# or
pm2 start ecosystem.config.js
pm2 save
```

**Legacy Method (if not using ecosystem.config.js):**
```bash
pm2 restart web
```

---

## Environment Configuration

### Setup Environment Variables

1. Copy the production template:
```bash
cp env.production.template .env
```

2. Edit `.env` file:
```bash
nano .env
```

3. Fill in required values:
```env
NODE_ENV=production
DATABASE_URL="postgresql://pondok_user:YOUR_PASSWORD@localhost:5432/sistem_pondok"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://YOUR_VPS_IP:3000"
ENCRYPTION_KEY="$(openssl rand -hex 16)"
```

4. Generate secrets:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 16
```

---

## PM2 Management

### View Application Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs web
# or
npm run pm2:logs

# View last 100 lines
pm2 logs web --lines 100
```

### Monitor Application
```bash
pm2 monit
# or
npm run pm2:monit
```

### Stop Application
```bash
pm2 stop web
# or
npm run pm2:stop
```

### Setup Auto-Restart on Server Reboot
```bash
pm2 startup
# Follow the instructions shown
pm2 save
```

---

## Verification

### 1. Check Application Status
```bash
pm2 status
```

Expected output: `web` process should be `online`

### 2. Check Logs
```bash
pm2 logs web --lines 50
```

Look for:
- ✅ "Server started on port 3000"
- ✅ No error messages
- ❌ Connection errors
- ❌ Build errors

### 3. Test in Browser
- Visit: `http://YOUR_VPS_IP:3000`
- Try logging in
- Test file upload (add lembaga with logo)
- Check all main features

### 4. Test Database Connection
```bash
# Connect to PostgreSQL
psql -U pondok_user -d sistem_pondok

# Check tables exist
\dt

# Exit
\q
```

---

## Troubleshooting

### ❌ 404 Errors for JavaScript Chunks

**Symptoms:**
```
Failed to load resource: /_next/static/chunks/9133986d7fccc522.js (404)
Refused to execute script because its MIME type ('') is not executable
```

**Root Cause:**
Static files were not copied to the standalone build directory.

**Solution:**

1. **SSH into VPS:**
   ```bash
   ssh user@your-vps-ip
   cd /var/www/sistem-pondok
   ```

2. **Verify static files exist in build:**
   ```bash
   ls -la .next/static/
   ```

3. **Copy static files to standalone:**
   ```bash
   cp -r .next/static .next/standalone/.next/
   cp -r public .next/standalone/
   ```

4. **Verify files were copied:**
   ```bash
   ls -la .next/standalone/.next/static/
   ls -la .next/standalone/public/
   ```

5. **Restart application:**
   ```bash
   pm2 restart web
   ```

6. **Check browser console:**
   - Refresh the page
   - Open browser DevTools (F12)
   - Check Console tab - should have no 404 errors
   - Check Network tab - all chunks should load with 200 status

**Prevention:**
Always use the `deploy-vps.sh` script which handles static file copying automatically.

---

### Git Authentication Issues

If `git pull` asks for username/password:

**Option A: Use SSH Keys (Recommended)**
1. Generate key on VPS:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. View public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
3. Add to GitHub:
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste the key and save
4. Test connection:
   ```bash
   ssh -T git@github.com
   ```
5. Switch remote to SSH:
   ```bash
   git remote set-url origin git@github.com:username/repo-name.git
   ```

**Option B: Personal Access Token**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (select `repo` scope)
3. When `git pull` asks for password, paste the token

### Build Errors

**Out of Memory:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Prisma Client Not Generated:**
```bash
npx prisma generate
npm run build
```

### Database Connection Errors

**Connection Refused:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if stopped
sudo systemctl start postgresql
```

**Authentication Failed:**
- Verify credentials in `.env`
- Check PostgreSQL user exists
- Verify `pg_hba.conf` allows local connections

### PM2 Process Not Found

```bash
# List all processes
pm2 list

# If empty, start new process
npm run pm2:start

# Save configuration
pm2 save
```

### Application Keeps Restarting

```bash
# Check logs for errors
pm2 logs web --lines 100

# Common causes:
# - Port already in use
# - Database connection failed
# - Missing environment variables
# - Syntax errors in code
```

### File Upload Errors

```bash
# Ensure uploads directory exists
mkdir -p public/uploads
mkdir -p .next/standalone/public/uploads

# Set proper permissions
chmod -R 755 public/uploads
chmod -R 755 .next/standalone/public/uploads
```

---

## Performance Tips

1. **Enable PM2 Cluster Mode** (for multiple CPU cores):
   Edit `ecosystem.config.js`:
   ```javascript
   instances: 2,  // Number of CPU cores
   ```

2. **Setup Log Rotation**:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   ```

3. **Monitor Memory Usage**:
   ```bash
   pm2 monit
   ```

4. **Database Optimization**:
   - Regular backups
   - Index optimization
   - Connection pooling (handled by Prisma)

---

## Security Checklist

- ✅ Strong database passwords
- ✅ `NODE_ENV=production` set
- ✅ Firewall configured (ufw)
- ✅ Regular system updates
- ✅ SSL/TLS certificate (recommended)
- ✅ Regular backups
- ✅ `.env` file not in Git

---

## Quick Reference

```bash
# Deployment
./deploy-vps.sh

# PM2 Commands
pm2 start ecosystem.config.js
pm2 restart web
pm2 stop web
pm2 logs web
pm2 monit
pm2 status

# Database
npx prisma migrate deploy
npx prisma generate

# Build
npm run build
```

---

## Additional Resources

- [VPS-OPTIMIZATION-GUIDE.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/VPS-OPTIMIZATION-GUIDE.md) - Comprehensive optimization guide
- [VPS-ENV-TEMPLATE.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/VPS-ENV-TEMPLATE.md) - Environment configuration details
- [DATABASE_MIGRATION.md](file:///d:/OneDrive/1.%20Pondok/Sistem%20Web%20Pondok%20Tadzimussunnah/DATABASE_MIGRATION.md) - Database migration guide
