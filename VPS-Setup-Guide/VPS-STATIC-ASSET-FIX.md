# VPS Static Asset Fix - Deployment Guide

This guide will help you fix the 404 and MIME type errors for static assets on your VPS.

## 🎯 Problem Summary

Your Next.js application on the VPS is experiencing:
- ❌ 404 errors for all `/_next/static/` files (CSS, JavaScript)
- ❌ MIME type errors (files served as `text/plain` instead of correct types)
- ❌ Application not loading due to missing assets

**Root Cause**: Nginx is not configured to serve static files from the Next.js standalone build directory.

---

## 📋 Prerequisites

- SSH access to your VPS
- Root/sudo privileges
- Basic knowledge of terminal commands

---

## 🚀 Step-by-Step Fix

### Step 1: Upload Files to VPS

First, commit and push the new files to your Git repository:

```bash
# On your local machine
git add vps-static-diagnostic.sh nginx-static-fix.conf deploy-vps.sh
git commit -m "Add VPS static asset fix"
git push origin main
```

### Step 2: SSH into Your VPS

```bash
ssh your-username@72.61.210.79
```

### Step 3: Pull Latest Changes

```bash
cd /var/www/sistem-pondok
git pull origin main
```

### Step 4: Run Diagnostic Script

This will identify the exact issue:

```bash
chmod +x vps-static-diagnostic.sh
bash vps-static-diagnostic.sh
```

**Expected Output**: The script will check 7 things and tell you what's wrong.

### Step 5: Apply Nginx Configuration

#### Option A: Full Config Replacement (Recommended)

```bash
# Backup current config
sudo cp /etc/nginx/sites-available/sistem-pondok /etc/nginx/sites-available/sistem-pondok.backup

# Copy new config
sudo cp nginx-static-fix.conf /etc/nginx/sites-available/sistem-pondok

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

#### Option B: Manual Edit (If you have custom settings)

```bash
# Edit your existing config
sudo nano /etc/nginx/sites-available/sistem-pondok
```

Add these location blocks inside your `server` block:

```nginx
# Serve Next.js static files
location /_next/static/ {
    alias /var/www/sistem-pondok/.next/standalone/.next/static/;
    expires 1y;
    access_log off;
    add_header Cache-Control "public, immutable";
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
}

# Serve uploads
location /uploads/ {
    alias /var/www/sistem-pondok/.next/standalone/public/uploads/;
    expires 1y;
    access_log off;
}
```

Save (Ctrl+O, Enter, Ctrl+X) and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Redeploy Application

Run the enhanced deployment script:

```bash
bash deploy-vps.sh
```

This will:
1. Pull latest code
2. Install dependencies
3. Run migrations
4. Build the app
5. **Verify static files are copied** (new!)
6. Restart PM2

### Step 7: Verify the Fix

1. **Check browser**: Visit `http://72.61.210.79`
   - Page should load with proper styling
   - No console errors

2. **Check Network tab** (F12 → Network):
   - All `/_next/static/` files should return **200 OK**
   - MIME types should be correct:
     - `.css` → `text/css`
     - `.js` → `application/javascript`

3. **Run diagnostic again**:
   ```bash
   bash vps-static-diagnostic.sh
   ```
   All checks should pass ✅

---

## 🔧 Troubleshooting

### Issue: Static files still 404

**Solution**: Verify files exist in standalone build:

```bash
ls -la /var/www/sistem-pondok/.next/standalone/.next/static/
```

If empty, rebuild:

```bash
npm run build
cp -r .next/static .next/standalone/.next/
pm2 restart web
```

### Issue: Permission denied

**Solution**: Fix permissions:

```bash
chmod -R 755 /var/www/sistem-pondok/.next/standalone
sudo systemctl reload nginx
```

### Issue: Nginx test fails

**Solution**: Check syntax errors:

```bash
sudo nginx -t
```

Review the error message and fix the config file.

### Issue: PM2 process won't start

**Solution**: Check logs:

```bash
pm2 logs web --lines 50
```

Look for errors and fix accordingly.

---

## 📊 Quick Reference Commands

```bash
# Check Nginx status
sudo systemctl status nginx

# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs web

# Restart everything
pm2 restart web
sudo systemctl reload nginx

# Run diagnostic
bash vps-static-diagnostic.sh
```

---

## ✅ Success Checklist

- [ ] Diagnostic script runs without errors
- [ ] Nginx configuration updated and tested
- [ ] Application redeployed successfully
- [ ] Website loads with proper CSS/styling
- [ ] No 404 errors in browser console
- [ ] No MIME type errors in browser console
- [ ] All interactive features work

---

## 📞 Need Help?

If you encounter issues:

1. Run the diagnostic script and share the output
2. Check PM2 logs: `pm2 logs web --lines 50`
3. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
4. Share any error messages you see

---

## 🎉 Expected Result

After completing these steps, your VPS should:
- ✅ Serve all static assets correctly
- ✅ Display proper styling and fonts
- ✅ Execute JavaScript without errors
- ✅ Have fast page loads with proper caching
