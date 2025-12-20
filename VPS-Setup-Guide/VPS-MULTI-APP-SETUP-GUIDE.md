# 🚀 VPS Multi-Application Setup Guide
## Fresh Install, Maximum Security & Multi-Domain Configuration

> [!CAUTION]
> **Complete VPS Reinstallation Guide**
> 
> This guide will walk you through:
> - ✅ Complete VPS fresh installation
> - ✅ Maximum security hardening
> - ✅ Multi-application/multi-domain configuration
> - ✅ Environment matching your local setup
> 
> **Before You Begin:**
> - ✅ Backup all databases
> - ✅ Save all configuration files
> - ✅ Note down all credentials and API keys
> - ✅ Access to domain DNS settings

---

## 📋 Table of Contents

1. [Pre-Installation Backup](#phase-1-pre-installation-backup)
2. [VPS Fresh Installation](#phase-2-vps-fresh-installation)
3. [Maximum Security Hardening](#phase-3-maximum-security-hardening)
4. [Application Stack Installation](#phase-4-application-stack-installation)
5. [Multi-Application Configuration](#phase-5-multi-application-configuration)
6. [Nginx Multi-Domain Setup](#phase-6-nginx-multi-domain-setup)
7. [SSL Certificate Management](#phase-7-ssl-certificate-management)
8. [Advanced Security Measures](#phase-8-advanced-security-measures)
9. [Monitoring & Maintenance](#phase-9-monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Phase 1: Pre-Installation Backup

### 1.1 Database Backup

```bash
# SSH into your current VPS
ssh root@your-vps-ip

# Backup PostgreSQL database
pg_dump -U postgres sistem_pondok > ~/sistem_pondok_backup_$(date +%Y%m%d).sql

# If you have multiple databases, backup all
pg_dumpall -U postgres > ~/all_databases_backup_$(date +%Y%m%d).sql

# Download backup to local machine
# On your local Windows PowerShell:
scp root@your-vps-ip:~/sistem_pondok_backup_*.sql ./
scp root@your-vps-ip:~/all_databases_backup_*.sql ./
```

### 1.2 Backup Environment Variables

```bash
# Backup all .env files
find /var/www -name ".env" -exec cp {} {}.backup \;

# Create a consolidated backup
mkdir -p ~/env-backups
find /var/www -name ".env" | while read file; do
    app_name=$(echo $file | sed 's/\/var\/www\///g' | sed 's/\//.env./g')
    cp "$file" ~/env-backups/"$app_name"
done

# Download to local
scp -r root@your-vps-ip:~/env-backups ./
```

### 1.3 Backup Nginx Configurations

```bash
# Backup all nginx site configurations
sudo tar -czf ~/nginx_configs_backup.tar.gz /etc/nginx/sites-available/ /etc/nginx/sites-enabled/

# Download to local
scp root@your-vps-ip:~/nginx_configs_backup.tar.gz ./
```

### 1.4 Backup Uploaded Files (Optional)

```bash
# List all upload directories
find /var/www -type d -name "uploads"

# Backup uploads (SCAN FIRST!)
tar -czf ~/uploads_backup.tar.gz /var/www/*/public/uploads/

# Download to local
scp root@your-vps-ip:~/uploads_backup.tar.gz ./
```

> [!WARNING]
> **DO NOT restore uploaded files** without scanning them first! They may contain malware.
> Use ClamAV to scan: `clamscan -r uploads_backup/`

---

## Phase 2: VPS Fresh Installation

### 2.1 Reinstall VPS via Hostinger Panel

1. Login to **Hostinger VPS Panel**
2. Navigate to **VPS Management** → **Operating System**
3. Click **"Reinstall OS"**
4. Select: **Ubuntu 22.04 LTS** (recommended for stability)
5. Set a **strong root password** (use password manager)
6. Confirm reinstall

⏱️ **Wait 5-10 minutes** for reinstall to complete.

### 2.2 First Login & System Update

```bash
# SSH into fresh VPS
ssh root@your-vps-ip

# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git ufw fail2ban unattended-upgrades

# Set timezone (adjust to your location)
timedatectl set-timezone Asia/Jakarta

# Verify timezone
timedatectl
```

---

## Phase 3: Maximum Security Hardening

### 3.1 Create Non-Root User

```bash
# Create deployment user
adduser deploy
# Set a strong password when prompted

# Add to sudo group
usermod -aG sudo deploy

# Test sudo access
su - deploy
sudo whoami  # Should output: root
```

### 3.2 SSH Key Authentication

**On your LOCAL Windows machine (PowerShell):**

```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key to VPS
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh deploy@your-vps-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**On VPS:**

```bash
# Set proper permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Verify key was added
cat ~/.ssh/authorized_keys
```

### 3.3 SSH Hardening

```bash
# Backup original SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

**Make these changes:**

```conf
# Disable root login
PermitRootLogin no

# Disable password authentication (key-only)
PasswordAuthentication no
PubkeyAuthentication yes

# Change SSH port (security through obscurity)
Port 2222

# Disable empty passwords
PermitEmptyPasswords no

# Limit authentication attempts
MaxAuthTries 3

# Disable X11 forwarding
X11Forwarding no

# Enable strict mode
StrictModes yes

# Set login grace time
LoginGraceTime 30

# Allow only specific users
AllowUsers deploy
```

**Test and apply:**

```bash
# Test configuration
sudo sshd -t

# If no errors, restart SSH
sudo systemctl restart sshd
```

> [!IMPORTANT]
> **Test SSH with new settings BEFORE logging out!**
> 
> Open a **NEW terminal** and test:
> ```bash
> ssh -p 2222 deploy@your-vps-ip
> ```
> 
> Keep your current session open until you confirm the new connection works!

### 3.4 Firewall Configuration (UFW)

```bash
# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (new port)
sudo ufw allow 2222/tcp comment 'SSH'

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Optional: Allow specific ports for applications
# sudo ufw allow 8080/tcp comment 'App Port'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### 3.5 Fail2Ban Configuration

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create local configuration
sudo nano /etc/fail2ban/jail.local
```

**Add this configuration:**

```ini
[DEFAULT]
# Ban for 1 hour
bantime = 3600

# 10 minute window
findtime = 600

# 3 attempts before ban
maxretry = 3

# Email notifications (optional)
destemail = your-email@example.com
sendername = Fail2Ban
action = %(action_mwl)s

[sshd]
enabled = true
port = 2222
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
```

```bash
# Restart fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## Phase 4: Application Stack Installation

### 4.1 Install Node.js 20 LTS

```bash
# Install Node.js 20 (matching your local environment)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install build essentials
sudo apt install -y build-essential
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

# Create database for main application
sudo -u postgres createdb sistem_pondok
```

### 4.3 Secure PostgreSQL

```bash
# Edit PostgreSQL authentication config
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Change this line:**
```conf
# FROM:
local   all             postgres                                peer

# TO:
local   all             postgres                                md5
```

```bash
# Edit PostgreSQL config for network access (if needed)
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**For local-only access (recommended):**
```conf
listen_addresses = 'localhost'
```

**For remote access (if needed):**
```conf
listen_addresses = '*'
max_connections = 100
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
psql -U postgres -d sistem_pondok
# Enter password when prompted
# Type \q to exit
```

### 4.4 Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
# Copy and run the command it outputs

# Install PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 4.5 Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test Nginx is running
curl http://localhost
```

---

## Phase 5: Multi-Application Configuration

### 5.1 Directory Structure

Create a well-organized directory structure for multiple applications:

```bash
# Create main web directory
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www

# Create directory for each application
cd /var/www
mkdir -p sistem-pondok
mkdir -p radio-tsn
mkdir -p psb-subdomain
# Add more as needed

# Directory structure will look like:
# /var/www/
# ├── sistem-pondok/      (Main application - tsn.ponpes.id)
# ├── radio-tsn/          (Radio app - radio.tsn.ponpes.id)
# └── psb-subdomain/      (PSB app - psb.tsn.ponpes.id)
```

### 5.2 Clone Repositories

```bash
# Clone main application
cd /var/www/sistem-pondok
git clone https://github.com/YOUR_USERNAME/sistem-pondok.git .

# Clone other applications (if separate repos)
cd /var/www/radio-tsn
git clone https://github.com/YOUR_USERNAME/radio-tsn.git .

# Or create symlinks if apps share codebase
# ln -s /var/www/sistem-pondok /var/www/psb-subdomain
```

### 5.3 Configure Environment for Each App

**Main Application (sistem-pondok):**

```bash
cd /var/www/sistem-pondok
nano .env
```

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sistem_pondok?schema=public"

# NextAuth
NEXTAUTH_URL="https://tsn.ponpes.id"
NEXTAUTH_SECRET="YOUR_STRONG_SECRET_HERE"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Encryption
ENCRYPTION_KEY="YOUR_32_CHAR_ENCRYPTION_KEY_HERE"

# Node Environment
NODE_ENV="production"
```

**Radio Application (if separate):**

```bash
cd /var/www/radio-tsn
nano .env
```

```env
# Radio-specific configuration
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/radio_tsn?schema=public"
NEXTAUTH_URL="https://radio.tsn.ponpes.id"
# ... other configs
```

> [!TIP]
> **Generate strong secrets:**
> ```bash
> # Generate NEXTAUTH_SECRET
> openssl rand -base64 32
> 
> # Generate ENCRYPTION_KEY (32 characters)
> openssl rand -hex 16
> ```

### 5.4 Install Dependencies & Build

**For each Next.js application:**

```bash
cd /var/www/sistem-pondok

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Copy static files (for standalone mode)
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Create uploads directory
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads
```

### 5.5 PM2 Multi-Application Setup

Create a PM2 ecosystem file for managing multiple applications:

```bash
nano /var/www/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'sistem-pondok',
      cwd: '/var/www/sistem-pondok',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/logs/sistem-pondok-error.log',
      out_file: '/var/www/logs/sistem-pondok-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    },
    {
      name: 'radio-tsn',
      cwd: '/var/www/radio-tsn',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/www/logs/radio-tsn-error.log',
      out_file: '/var/www/logs/radio-tsn-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'psb-subdomain',
      cwd: '/var/www/psb-subdomain',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/www/logs/psb-subdomain-error.log',
      out_file: '/var/www/logs/psb-subdomain-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    }
  ]
};
```

```bash
# Create logs directory
mkdir -p /var/www/logs

# Start all applications
pm2 start /var/www/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

---

## Phase 6: Nginx Multi-Domain Setup

### 6.1 Nginx Global Configuration

```bash
# Edit main nginx config
sudo nano /etc/nginx/nginx.conf
```

**Add/modify these settings:**

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    ##
    # Basic Settings
    ##
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Security headers (global)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    
    # File upload limits
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    ##
    # Logging Settings
    ##
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    ##
    # Gzip Settings
    ##
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    
    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### 6.2 Main Application (tsn.ponpes.id)

```bash
sudo nano /etc/nginx/sites-available/sistem-pondok
```

```nginx
# Upstream for main application
upstream sistem_pondok_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name tsn.ponpes.id www.tsn.ponpes.id;
    
    # Redirect to HTTPS (will be configured by Certbot)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tsn.ponpes.id www.tsn.ponpes.id;
    
    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/tsn.ponpes.id/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tsn.ponpes.id/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Disable server signature
    server_tokens off;
    
    # Logging
    access_log /var/log/nginx/sistem-pondok-access.log;
    error_log /var/log/nginx/sistem-pondok-error.log;
    
    # Disable script execution in uploads directory
    location ~* ^/uploads/.*\.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi|exe)$ {
        deny all;
        return 403;
    }
    
    # Serve only images from uploads directory
    location /uploads/ {
        alias /var/www/sistem-pondok/.next/standalone/public/uploads/;
        
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
    
    # Rate limiting for API endpoints
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_conn conn_limit 10;
        
        proxy_pass http://sistem_pondok_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Proxy to Next.js
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        
        proxy_pass http://sistem_pondok_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 6.3 Radio Subdomain (radio.tsn.ponpes.id)

```bash
sudo nano /etc/nginx/sites-available/radio-tsn
```

```nginx
# Upstream for radio application
upstream radio_tsn_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name radio.tsn.ponpes.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name radio.tsn.ponpes.id;
    
    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/radio.tsn.ponpes.id/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/radio.tsn.ponpes.id/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # Logging
    access_log /var/log/nginx/radio-tsn-access.log;
    error_log /var/log/nginx/radio-tsn-error.log;
    
    # Proxy to Radio App
    location / {
        proxy_pass http://radio_tsn_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.4 PSB Subdomain (psb.tsn.ponpes.id)

```bash
sudo nano /etc/nginx/sites-available/psb-subdomain
```

```nginx
# Upstream for PSB application
upstream psb_backend {
    server 127.0.0.1:3002;
    keepalive 32;
}

server {
    listen 80;
    server_name psb.tsn.ponpes.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name psb.tsn.ponpes.id;
    
    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/psb.tsn.ponpes.id/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/psb.tsn.ponpes.id/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Logging
    access_log /var/log/nginx/psb-access.log;
    error_log /var/log/nginx/psb-error.log;
    
    # Proxy to PSB App
    location / {
        proxy_pass http://psb_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.5 Enable Sites

```bash
# Enable all sites
sudo ln -s /etc/nginx/sites-available/sistem-pondok /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/radio-tsn /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/psb-subdomain /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Phase 7: SSL Certificate Management

### 7.1 Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificates

**For main domain:**

```bash
sudo certbot --nginx -d tsn.ponpes.id -d www.tsn.ponpes.id
```

**For radio subdomain:**

```bash
sudo certbot --nginx -d radio.tsn.ponpes.id
```

**For PSB subdomain:**

```bash
sudo certbot --nginx -d psb.tsn.ponpes.id
```

**Or get all at once:**

```bash
sudo certbot --nginx -d tsn.ponpes.id -d www.tsn.ponpes.id -d radio.tsn.ponpes.id -d psb.tsn.ponpes.id
```

Follow the prompts:
- Enter email address
- Agree to terms
- Choose option 2: **Redirect HTTP to HTTPS**

### 7.3 Test Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

---

## Phase 8: Advanced Security Measures

### 8.1 Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Edit configuration
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

**Enable automatic reboot if needed:**

```conf
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
```

### 8.2 Install ClamAV (Antivirus)

```bash
# Install ClamAV
sudo apt install -y clamav clamav-daemon

# Stop service to update
sudo systemctl stop clamav-freshclam

# Update virus definitions
sudo freshclam

# Start service
sudo systemctl start clamav-freshclam
sudo systemctl enable clamav-freshclam
```

**Create upload scan script:**

```bash
sudo nano /usr/local/bin/scan-uploads.sh
```

```bash
#!/bin/bash
UPLOAD_DIRS=(
    "/var/www/sistem-pondok/.next/standalone/public/uploads"
    "/var/www/radio-tsn/public/uploads"
    "/var/www/psb-subdomain/public/uploads"
)
LOG_FILE="/var/log/clamav-uploads-scan.log"

echo "=== Scan started at $(date) ===" >> $LOG_FILE

for dir in "${UPLOAD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "Scanning: $dir" >> $LOG_FILE
        clamscan -r -i "$dir" >> $LOG_FILE 2>&1
    fi
done

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

### 8.3 File Integrity Monitoring (AIDE)

```bash
# Install AIDE
sudo apt install -y aide

# Initialize AIDE database
sudo aideinit

# Move database
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Create check script
sudo nano /usr/local/bin/aide-check.sh
```

```bash
#!/bin/bash
/usr/bin/aide --check | mail -s "AIDE Report - $(hostname)" your-email@example.com
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/aide-check.sh

# Add to crontab (daily check at 3 AM)
sudo crontab -e

# Add:
0 3 * * * /usr/local/bin/aide-check.sh
```

### 8.4 Setup Logwatch

```bash
# Install logwatch
sudo apt install -y logwatch

# Configure logwatch
sudo nano /etc/logwatch/conf/logwatch.conf
```

```conf
Output = mail
Format = html
MailTo = your-email@example.com
MailFrom = logwatch@tsn.ponpes.id
Detail = Med
Range = yesterday
Service = All
```

---

## Phase 9: Monitoring & Maintenance

### 9.1 Setup Log Rotation

```bash
# Create logrotate config for applications
sudo nano /etc/logrotate.d/vps-apps
```

```conf
/var/www/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 9.2 Database Backup Automation

```bash
# Create backup script
nano ~/backup-databases.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup all databases
pg_dumpall -U postgres > $BACKUP_DIR/all_databases_$DATE.sql

# Backup individual databases
pg_dump -U postgres sistem_pondok > $BACKUP_DIR/sistem_pondok_$DATE.sql
pg_dump -U postgres radio_tsn > $BACKUP_DIR/radio_tsn_$DATE.sql

# Compress backups
gzip $BACKUP_DIR/*_$DATE.sql

# Delete old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log backup
echo "Backup completed at $(date)" >> $BACKUP_DIR/backup.log
```

```bash
# Make executable
chmod +x ~/backup-databases.sh

# Add to crontab (daily at 1 AM)
crontab -e

# Add:
0 1 * * * /home/deploy/backup-databases.sh
```

### 9.3 System Monitoring

**Install htop and iotop:**

```bash
sudo apt install -y htop iotop
```

**Monitor PM2 applications:**

```bash
# Real-time monitoring
pm2 monit

# Application status
pm2 status

# Logs
pm2 logs

# Resource usage
pm2 describe sistem-pondok
```

### 9.4 Setup Uptime Monitoring

Use external services like:
- **UptimeRobot** (https://uptimerobot.com/) - Free tier available
- **Pingdom** (https://www.pingdom.com/)
- **StatusCake** (https://www.statuscake.com/)

Monitor all your domains:
- https://tsn.ponpes.id
- https://radio.tsn.ponpes.id
- https://psb.tsn.ponpes.id

---

## Phase 10: Deployment Automation

### 10.1 Create Deployment Script for Each App

**Main Application:**

```bash
nano /var/www/sistem-pondok/deploy.sh
```

```bash
#!/bin/bash
set -e

APP_NAME="sistem-pondok"
APP_DIR="/var/www/sistem-pondok"
PM2_APP="sistem-pondok"

echo "🚀 Deploying $APP_NAME..."

cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy
npx prisma generate

# Build application
echo "🔨 Building application..."
npm run build

# Copy static files
echo "📁 Copying static files..."
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Ensure uploads directory exists
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# Restart PM2
echo "🔄 Restarting application..."
pm2 restart $PM2_APP

# Check status
echo "✅ Deployment complete!"
pm2 status $PM2_APP
pm2 logs $PM2_APP --lines 20
```

```bash
chmod +x /var/www/sistem-pondok/deploy.sh
```

### 10.2 Create Master Deployment Script

```bash
nano /var/www/deploy-all.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Deploying all applications..."

# Deploy main app
if [ -f "/var/www/sistem-pondok/deploy.sh" ]; then
    echo "Deploying sistem-pondok..."
    /var/www/sistem-pondok/deploy.sh
fi

# Deploy radio app
if [ -f "/var/www/radio-tsn/deploy.sh" ]; then
    echo "Deploying radio-tsn..."
    /var/www/radio-tsn/deploy.sh
fi

# Deploy PSB app
if [ -f "/var/www/psb-subdomain/deploy.sh" ]; then
    echo "Deploying psb-subdomain..."
    /var/www/psb-subdomain/deploy.sh
fi

echo "✅ All applications deployed!"
pm2 status
```

```bash
chmod +x /var/www/deploy-all.sh
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs sistem-pondok --lines 100

# Check if port is in use
sudo lsof -i :3000

# Restart application
pm2 restart sistem-pondok

# Check environment variables
pm2 env sistem-pondok
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d sistem_pondok

# Check DATABASE_URL
cat /var/www/sistem-pondok/.env | grep DATABASE_URL

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check specific app logs
sudo tail -f /var/log/nginx/sistem-pondok-error.log

# Restart nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Force renew
sudo certbot renew --force-renewal

# Check nginx SSL config
sudo nginx -t
```

### Firewall Blocking Connections

```bash
# Check UFW status
sudo ufw status verbose

# Check if port is allowed
sudo ufw status | grep 443

# Allow port if needed
sudo ufw allow 443/tcp

# Check fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

## Security Checklist

- [ ] Root login disabled
- [ ] SSH key authentication only
- [ ] SSH running on non-standard port (2222)
- [ ] Firewall (UFW) enabled and configured
- [ ] Fail2Ban active and monitoring
- [ ] PostgreSQL secured with strong password
- [ ] SSL certificates installed for all domains
- [ ] Nginx security headers configured
- [ ] Upload directory script execution disabled
- [ ] File upload validation with magic bytes
- [ ] Automatic security updates enabled
- [ ] ClamAV antivirus installed and scheduled
- [ ] File integrity monitoring (AIDE) configured
- [ ] Log rotation configured
- [ ] PM2 running and saved
- [ ] Database backups automated
- [ ] All credentials are strong and unique
- [ ] Uptime monitoring configured
- [ ] Email notifications setup

---

## Quick Reference Commands

### System Management

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Check firewall
sudo ufw status verbose

# Check fail2ban
sudo fail2ban-client status

# Check disk space
df -h

# Check memory
free -h

# Check CPU
htop
```

### PM2 Management

```bash
# Start all apps
pm2 start /var/www/ecosystem.config.js

# Restart all apps
pm2 restart all

# Stop all apps
pm2 stop all

# View logs
pm2 logs

# Monitor
pm2 monit

# Save configuration
pm2 save
```

### Database Management

```bash
# Backup database
pg_dump -U postgres sistem_pondok > backup.sql

# Restore database
psql -U postgres -d sistem_pondok < backup.sql

# Connect to database
psql -U postgres -d sistem_pondok

# List databases
psql -U postgres -c "\l"
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
```

---

## Additional Resources

- [Ubuntu Security Guide](https://ubuntu.com/security)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

> [!NOTE]
> **Post-Setup Recommendations**
> 
> 1. **Monitor logs daily** for the first week
> 2. **Test all applications** thoroughly
> 3. **Setup monitoring alerts** (UptimeRobot recommended)
> 4. **Document any custom changes** you make
> 5. **Keep credentials in a secure password manager**
> 6. **Test backup restoration** regularly
> 7. **Review security logs** weekly
> 8. **Update applications** regularly

**Your VPS is now configured for multiple applications with maximum security! 🔒🚀**
