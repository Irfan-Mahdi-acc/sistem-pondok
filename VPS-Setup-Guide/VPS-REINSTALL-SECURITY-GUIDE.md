# VPS Fresh Reinstall & Maximum Security Setup Guide

> [!CAUTION]
> **Before You Begin**
> 
> This guide will walk you through a complete VPS reinstall. Make sure you have:
> - ✅ Backed up your database
> - ✅ Saved all important configuration files
> - ✅ Noted down all credentials and API keys
> - ✅ Access to your domain DNS settings

---

## Phase 1: Backup Current Data

### 1.1 Database Backup

If your VPS is still accessible via SSH:

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Backup PostgreSQL database
pg_dump -U postgres sistem_pondok > ~/sistem_pondok_backup_$(date +%Y%m%d).sql

# Download backup to local machine
# On your local machine:
scp root@your-vps-ip:~/sistem_pondok_backup_*.sql ./
```

### 1.2 Backup Environment Variables

```bash
# Backup .env file
cat /var/www/sistem-pondok/.env > ~/env_backup.txt

# Download to local
scp root@your-vps-ip:~/env_backup.txt ./
```

### 1.3 Backup Uploaded Files (If Any Valid Ones Exist)

```bash
# Check uploads directory
ls -la /var/www/sistem-pondok/public/uploads/

# If there are valid files you want to keep, backup:
tar -czf ~/uploads_backup.tar.gz /var/www/sistem-pondok/public/uploads/

# Download to local
scp root@your-vps-ip:~/uploads_backup.tar.gz ./
```

> [!WARNING]
> **DO NOT restore uploaded files** without scanning them first! They may contain malware.

---

## Phase 2: VPS Reinstall

### 2.1 Reinstall VPS via Hostinger Panel

1. Login to Hostinger VPS panel
2. Go to **VPS Management** → **Operating System**
3. Click **"Reinstall OS"**
4. Select: **Ubuntu 22.04 LTS** (recommended)
5. Set a **strong root password**
6. Confirm reinstall

⏱️ Wait 5-10 minutes for reinstall to complete.

### 2.2 First Login & System Update

```bash
# SSH into fresh VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git ufw fail2ban
```

---

## Phase 3: Maximum Security Hardening

### 3.1 Create Non-Root User

```bash
# Create new user
adduser deploy

# Add to sudo group
usermod -aG sudo deploy

# Switch to new user
su - deploy
```

### 3.2 SSH Security Hardening

```bash
# Generate SSH key on your LOCAL machine (not VPS)
# On Windows PowerShell:
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key to VPS
# On Windows PowerShell:
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh deploy@your-vps-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

```bash
# On VPS, configure SSH
sudo nano /etc/ssh/sshd_config

# Make these changes:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change from default 22

# Save and restart SSH
sudo systemctl restart sshd
```

> [!IMPORTANT]
> **Test SSH with new settings BEFORE logging out!**
> 
> Open a new terminal and test:
> ```bash
> ssh -p 2222 deploy@your-vps-ip
> ```

### 3.3 Firewall Configuration

```bash
# Enable UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (new port)
sudo ufw allow 2222/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 3.4 Fail2Ban Configuration

```bash
# Configure fail2ban for SSH
sudo nano /etc/fail2ban/jail.local
```

Add this configuration:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
logpath = /var/log/auth.log
```

```bash
# Restart fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

---

## Phase 4: Install Application Stack

### 4.1 Install Node.js 20 LTS

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 4.2 Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'YOUR_STRONG_PASSWORD_HERE';"

# Create database
sudo -u postgres createdb sistem_pondok
```

### 4.3 Secure PostgreSQL

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Change this line:
# local   all             postgres                                peer
# To:
local   all             postgres                                md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 4.4 Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
# Follow the command it outputs
```

### 4.5 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Phase 5: Deploy Application

### 5.1 Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www

# Clone your repository
cd /var/www
git clone https://github.com/YOUR_USERNAME/sistem-pondok.git
cd sistem-pondok
```

### 5.2 Configure Environment

```bash
# Create .env file
nano .env
```

Add your environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sistem_pondok?schema=public"

# NextAuth
NEXTAUTH_URL="https://tsn.ponpes.id"
NEXTAUTH_SECRET="YOUR_STRONG_SECRET_HERE"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Encryption (for password retrieval)
ENCRYPTION_KEY="YOUR_32_CHAR_ENCRYPTION_KEY_HERE"

# Node Environment
NODE_ENV="production"
```

> [!TIP]
> Generate strong secrets:
> ```bash
> # Generate NEXTAUTH_SECRET
> openssl rand -base64 32
> 
> # Generate ENCRYPTION_KEY (32 characters)
> openssl rand -hex 16
> ```

### 5.3 Restore Database

```bash
# Copy your backup to VPS (from local machine)
scp -P 2222 sistem_pondok_backup_*.sql deploy@your-vps-ip:~/

# On VPS, restore database
psql -U postgres -d sistem_pondok < ~/sistem_pondok_backup_*.sql
```

### 5.4 Install Dependencies & Build

```bash
cd /var/www/sistem-pondok

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build application
npm run build
```

### 5.5 Start with PM2

```bash
# Start application
pm2 start npm --name "sistem-pondok" -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs sistem-pondok
```

---

## Phase 6: Nginx Configuration with Security

### 6.1 Create Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/sistem-pondok
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name tsn.ponpes.id;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Disable server signature
    server_tokens off;

    # Disable script execution in uploads directory
    location ~* ^/uploads/.*\.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi|exe)$ {
        deny all;
        return 403;
    }

    # Serve only images from uploads directory
    location /uploads/ {
        root /var/www/sistem-pondok/public;
        
        types {
            image/jpeg jpg jpeg;
            image/png png;
            image/gif gif;
            image/webp webp;
            image/svg+xml svg;
        }
        
        default_type application/octet-stream;
        add_header X-Content-Type-Options nosniff;
        autoindex off;
        
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting for API endpoints
    location /api/ {
        limit_req zone=api_limit burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

### 6.2 Enable Site & Test

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sistem-pondok /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Phase 7: SSL Certificate with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d tsn.ponpes.id

# Follow the prompts
# Choose option 2: Redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Phase 8: Additional Security Measures

### 8.1 Setup Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 8.2 Install ClamAV (Antivirus)

```bash
# Install ClamAV
sudo apt install -y clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Create scan script
sudo nano /usr/local/bin/scan-uploads.sh
```

Add this script:

```bash
#!/bin/bash
UPLOAD_DIR="/var/www/sistem-pondok/public/uploads"
LOG_FILE="/var/log/clamav-uploads-scan.log"

echo "=== Scan started at $(date) ===" >> $LOG_FILE
clamscan -r -i $UPLOAD_DIR >> $LOG_FILE 2>&1
echo "=== Scan completed at $(date) ===" >> $LOG_FILE
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/scan-uploads.sh

# Add to crontab (daily scan at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/scan-uploads.sh
```

### 8.3 File Integrity Monitoring

```bash
# Install AIDE
sudo apt install -y aide

# Initialize AIDE database
sudo aideinit

# Move database
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Add to crontab (daily check at 3 AM)
sudo crontab -e

# Add this line:
0 3 * * * /usr/bin/aide --check | mail -s "AIDE Report" your-email@example.com
```

---

## Phase 9: Monitoring & Logging

### 9.1 Setup Log Rotation

```bash
# Create logrotate config for application
sudo nano /etc/logrotate.d/sistem-pondok
```

Add:

```
/var/www/sistem-pondok/.next/standalone/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
}
```

### 9.2 Monitor PM2 Logs

```bash
# View logs
pm2 logs sistem-pondok

# Monitor in real-time
pm2 monit
```

---

## Phase 10: Final Security Checklist

- [ ] Root login disabled
- [ ] SSH key authentication only
- [ ] SSH running on non-standard port (2222)
- [ ] Firewall (UFW) enabled and configured
- [ ] Fail2Ban active
- [ ] PostgreSQL secured with password
- [ ] SSL certificate installed
- [ ] Nginx security headers configured
- [ ] Upload directory script execution disabled
- [ ] File upload validation with magic bytes
- [ ] Automatic security updates enabled
- [ ] ClamAV antivirus installed and scheduled
- [ ] File integrity monitoring (AIDE) configured
- [ ] Log rotation configured
- [ ] PM2 running and saved
- [ ] Database backed up
- [ ] All credentials are strong and unique

---

## Maintenance Commands

### Check System Status

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Check firewall
sudo ufw status

# Check fail2ban
sudo fail2ban-client status sshd

# Check disk space
df -h

# Check memory
free -h
```

### Update Application

```bash
cd /var/www/sistem-pondok

# Pull latest changes
git pull

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart sistem-pondok

# Check logs
pm2 logs sistem-pondok
```

### Database Backup (Regular)

```bash
# Create backup script
nano ~/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U postgres sistem_pondok > $BACKUP_DIR/sistem_pondok_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "sistem_pondok_*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 1 AM)
crontab -e

# Add:
0 1 * * * /home/deploy/backup-db.sh
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs sistem-pondok --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart application
pm2 restart sistem-pondok
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d sistem_pondok

# Check DATABASE_URL in .env
cat /var/www/sistem-pondok/.env | grep DATABASE_URL
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

---

## Emergency Contacts & Resources

- **Hostinger Support**: https://www.hostinger.com/support
- **Ubuntu Security**: https://ubuntu.com/security
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/

---

> [!NOTE]
> **Post-Setup Recommendations**
> 
> 1. **Monitor logs daily** for the first week
> 2. **Test file uploads** thoroughly
> 3. **Setup monitoring alerts** (consider using UptimeRobot)
> 4. **Document any custom changes** you make
> 5. **Keep credentials in a secure password manager**

**Your VPS is now secured with maximum security measures! 🔒**
