# VPS Extended Setup: PHP, AzuraCast, Gitea & Auto-Deploy

## 📋 Table of Contents

1. [PHP Stack Installation](#phase-11-php-stack-installation)
2. [AzuraCast Setup](#phase-12-azuracast-setup)
3. [Gitea Self-Hosted Git](#phase-13-gitea-self-hosted-git)
4. [Auto-Deploy System](#phase-14-auto-deploy-system)
5. [Complete Port Mapping](#complete-port-mapping)

---

## Phase 11: PHP Stack Installation

### 11.1 Install PHP-FPM

```bash
# Install PHP 8.2 and extensions
sudo apt install -y php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-pgsql php8.2-xml php8.2-curl \
    php8.2-mbstring php8.2-zip php8.2-gd php8.2-intl \
    php8.2-bcmath php8.2-opcache

# Start and enable PHP-FPM
sudo systemctl start php8.2-fpm
sudo systemctl enable php8.2-fpm

# Verify installation
php -v
```

### 11.2 Configure PHP-FPM

```bash
# Edit PHP-FPM pool configuration
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

**Recommended settings:**

```ini
[www]
user = www-data
group = www-data
listen = /run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

```bash
# Edit PHP configuration
sudo nano /etc/php/8.2/fpm/php.ini
```

**Important settings:**

```ini
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
memory_limit = 256M
date.timezone = Asia/Jakarta
```

```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

### 11.3 Nginx PHP Configuration Example

```nginx
# Example PHP site configuration
server {
    listen 80;
    server_name php-app.tsn.ponpes.id;
    
    root /var/www/php-app;
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
```

---

## Phase 12: AzuraCast Setup

### 12.1 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add deploy user to docker group
sudo usermod -aG docker deploy

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

### 12.2 Install AzuraCast

```bash
# Create AzuraCast directory
sudo mkdir -p /var/azuracast
sudo chown deploy:deploy /var/azuracast
cd /var/azuracast

# Download AzuraCast Docker installer
curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh > docker.sh
chmod +x docker.sh

# Run installation
./docker.sh install

# Follow the prompts:
# - Choose "Standard" installation
# - Set HTTP port: 8080 (we'll use Nginx reverse proxy)
# - Set HTTPS port: 8443
# - Set streaming ports: 8000-8999
# - Enable Let's Encrypt: No (we'll use Nginx for SSL)
```

### 12.3 Configure Firewall for AzuraCast

```bash
# Allow streaming ports
sudo ufw allow 8000:8999/tcp comment 'AzuraCast Streaming'

# Allow Docker ports (internal only, not exposed)
# Port 8080 will be proxied by Nginx
```

### 12.4 Nginx Reverse Proxy for AzuraCast

```bash
sudo nano /etc/nginx/sites-available/azuracast
```

```nginx
# Upstream for AzuraCast
upstream azuracast_backend {
    server 127.0.0.1:8080;
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
    access_log /var/log/nginx/azuracast-access.log;
    error_log /var/log/nginx/azuracast-error.log;
    
    # Increase timeouts for streaming
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
    
    # Proxy to AzuraCast
    location / {
        proxy_pass http://azuracast_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/azuracast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d radio.tsn.ponpes.id
```

### 12.5 AzuraCast Management Commands

```bash
# Navigate to AzuraCast directory
cd /var/azuracast

# Start AzuraCast
./docker.sh up -d

# Stop AzuraCast
./docker.sh down

# Restart AzuraCast
./docker.sh restart

# Update AzuraCast
./docker.sh update-self
./docker.sh update

# View logs
./docker.sh logs

# Backup AzuraCast
./docker.sh backup

# Access AzuraCast CLI
./docker.sh cli
```

### 12.6 Initial AzuraCast Setup

1. Visit `https://radio.tsn.ponpes.id`
2. Create admin account
3. Complete initial setup wizard
4. Configure your first radio station
5. Upload music and configure playlists

---

## Phase 13: Gitea Self-Hosted Git

### 13.1 Create Gitea Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE gitea;
CREATE USER gitea WITH PASSWORD 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE gitea TO gitea;
\q
```

### 13.2 Install Gitea

```bash
# Create gitea user
sudo adduser --system --group --disabled-password --shell /bin/bash --home /home/gitea gitea

# Download Gitea binary
cd /tmp
wget -O gitea https://dl.gitea.com/gitea/1.21.5/gitea-1.21.5-linux-amd64
chmod +x gitea

# Move to system location
sudo mv gitea /usr/local/bin/gitea

# Create required directories
sudo mkdir -p /var/lib/gitea/{custom,data,log}
sudo chown -R gitea:gitea /var/lib/gitea/
sudo chmod -R 750 /var/lib/gitea/

sudo mkdir -p /etc/gitea
sudo chown root:gitea /etc/gitea
sudo chmod 770 /etc/gitea
```

### 13.3 Create Gitea Systemd Service

```bash
sudo nano /etc/systemd/system/gitea.service
```

```ini
[Unit]
Description=Gitea (Git with a cup of tea)
After=syslog.target
After=network.target
After=postgresql.service

[Service]
RestartSec=2s
Type=simple
User=gitea
Group=gitea
WorkingDirectory=/var/lib/gitea/
ExecStart=/usr/local/bin/gitea web --config /etc/gitea/app.ini
Restart=always
Environment=USER=gitea HOME=/home/gitea GITEA_WORK_DIR=/var/lib/gitea

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start Gitea
sudo systemctl daemon-reload
sudo systemctl enable gitea
sudo systemctl start gitea

# Check status
sudo systemctl status gitea
```

### 13.4 Nginx Reverse Proxy for Gitea

```bash
sudo nano /etc/nginx/sites-available/gitea
```

```nginx
# Upstream for Gitea
upstream gitea_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name git.tsn.ponpes.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name git.tsn.ponpes.id;
    
    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/git.tsn.ponpes.id/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/git.tsn.ponpes.id/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # Logging
    access_log /var/log/nginx/gitea-access.log;
    error_log /var/log/nginx/gitea-error.log;
    
    # Increase max body size for Git operations
    client_max_body_size 512M;
    
    # Proxy to Gitea
    location / {
        proxy_pass http://gitea_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for large Git operations
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gitea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d git.tsn.ponpes.id
```

### 13.5 Initial Gitea Configuration

1. Visit `https://git.tsn.ponpes.id`
2. Complete initial setup:
   - **Database Type**: PostgreSQL
   - **Host**: localhost:5432
   - **Database Name**: gitea
   - **Username**: gitea
   - **Password**: YOUR_STRONG_PASSWORD
   - **Server Domain**: git.tsn.ponpes.id
   - **Gitea Base URL**: https://git.tsn.ponpes.id/
   - **SSH Server Port**: 22 (or your custom SSH port)
   - **HTTP Port**: 3000
   - **Application URL**: https://git.tsn.ponpes.id/
3. Create admin account
4. Configure settings as needed

### 13.6 Migrate Repositories to Gitea

```bash
# On your VPS, for each application
cd /var/www/sistem-pondok

# Add Gitea remote
git remote add gitea https://git.tsn.ponpes.id/your-username/sistem-pondok.git

# Push to Gitea
git push gitea main

# Change origin to Gitea
git remote set-url origin https://git.tsn.ponpes.id/your-username/sistem-pondok.git
```

---

## Phase 14: Auto-Deploy System

### 14.1 Create Webhook Receiver Service

```bash
# Create webhook service directory
sudo mkdir -p /var/www/webhook-service
sudo chown deploy:deploy /var/www/webhook-service
cd /var/www/webhook-service

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express body-parser crypto
```

### 14.2 Webhook Receiver Code

```bash
nano /var/www/webhook-service/server.js
```

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 9000;

// Load configuration
const config = {
    secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret-here',
    deployScripts: {
        'sistem-pondok': '/var/www/sistem-pondok/deploy.sh',
        'radio-tsn': '/var/www/radio-tsn/deploy.sh',
        'psb-subdomain': '/var/www/psb-subdomain/deploy.sh'
    }
};

// Middleware
app.use(bodyParser.json());

// Verify Gitea signature
function verifySignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return signature === digest;
}

// Log deployment
function logDeployment(repo, status, message) {
    const logFile = '/var/www/logs/webhook-deployments.log';
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${repo} - ${status}: ${message}\n`;
    
    fs.appendFileSync(logFile, logEntry);
    console.log(logEntry.trim());
}

// Webhook endpoint
app.post('/webhook/:repo', (req, res) => {
    const repo = req.params.repo;
    const signature = req.headers['x-gitea-signature'];
    const payload = JSON.stringify(req.body);
    
    // Verify signature
    if (!verifySignature(payload, signature, config.secret)) {
        logDeployment(repo, 'REJECTED', 'Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Check if deployment script exists
    const deployScript = config.deployScripts[repo];
    if (!deployScript || !fs.existsSync(deployScript)) {
        logDeployment(repo, 'ERROR', 'Deploy script not found');
        return res.status(404).json({ error: 'Deploy script not found' });
    }
    
    // Check if push to main branch
    const branch = req.body.ref;
    if (branch !== 'refs/heads/main') {
        logDeployment(repo, 'SKIPPED', `Push to ${branch}, not main`);
        return res.json({ message: 'Not main branch, skipping deployment' });
    }
    
    // Execute deployment
    logDeployment(repo, 'STARTED', 'Deployment initiated');
    
    exec(`bash ${deployScript}`, (error, stdout, stderr) => {
        if (error) {
            logDeployment(repo, 'FAILED', error.message);
            return res.status(500).json({ 
                error: 'Deployment failed', 
                details: error.message 
            });
        }
        
        logDeployment(repo, 'SUCCESS', 'Deployment completed');
        res.json({ 
            message: 'Deployment successful', 
            output: stdout 
        });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Webhook service running on http://127.0.0.1:${PORT}`);
    logDeployment('SYSTEM', 'STARTED', 'Webhook service initialized');
});
```

### 14.3 Create Environment File

```bash
nano /var/www/webhook-service/.env
```

```env
WEBHOOK_SECRET=your-strong-webhook-secret-here
NODE_ENV=production
```

### 14.4 PM2 Configuration for Webhook Service

Add to `/var/www/ecosystem-multi-app.config.js`:

```javascript
{
  name: 'webhook-service',
  cwd: '/var/www/webhook-service',
  script: 'server.js',
  instances: 1,
  exec_mode: 'fork',
  env: {
    NODE_ENV: 'production',
    PORT: 9000
  },
  error_file: '/var/www/logs/webhook-service-error.log',
  out_file: '/var/www/logs/webhook-service-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  merge_logs: true,
  autorestart: true,
  max_restarts: 10,
  min_uptime: '10s',
  max_memory_restart: '200M'
}
```

```bash
# Start webhook service
pm2 start /var/www/ecosystem-multi-app.config.js --only webhook-service
pm2 save
```

### 14.5 Nginx Configuration for Webhook Service

```bash
sudo nano /etc/nginx/sites-available/webhook
```

```nginx
server {
    listen 80;
    server_name webhook.tsn.ponpes.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name webhook.tsn.ponpes.id;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/webhook.tsn.ponpes.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webhook.tsn.ponpes.id/privkey.pem;
    
    # Security
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Logging
    access_log /var/log/nginx/webhook-access.log;
    error_log /var/log/nginx/webhook-error.log;
    
    # Proxy to webhook service
    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d webhook.tsn.ponpes.id
```

### 14.6 Configure Gitea Webhooks

For each repository in Gitea:

1. Go to repository **Settings** → **Webhooks**
2. Click **Add Webhook** → **Gitea**
3. Configure:
   - **Target URL**: `https://webhook.tsn.ponpes.id/webhook/sistem-pondok`
   - **HTTP Method**: POST
   - **POST Content Type**: application/json
   - **Secret**: your-strong-webhook-secret-here
   - **Trigger On**: Push events
   - **Branch filter**: main
   - **Active**: ✓
4. Click **Add Webhook**
5. Test webhook

### 14.7 Create Individual Deployment Scripts

**For sistem-pondok:**

```bash
nano /var/www/sistem-pondok/deploy.sh
```

```bash
#!/bin/bash
set -e

APP_NAME="sistem-pondok"
APP_DIR="/var/www/sistem-pondok"
PM2_APP="sistem-pondok"

echo "🚀 Auto-deploying $APP_NAME..."

cd $APP_DIR

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy
npx prisma generate

# Build
npm run build

# Copy static files
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Restart PM2
pm2 restart $PM2_APP

echo "✅ Auto-deployment complete!"
```

```bash
chmod +x /var/www/sistem-pondok/deploy.sh
```

Repeat for other applications.

### 14.8 Deployment Notification (Optional)

Add to webhook service for Telegram/Discord notifications:

```javascript
// Add to server.js
const axios = require('axios');

async function sendNotification(repo, status, message) {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!telegramToken || !telegramChatId) return;
    
    const emoji = status === 'SUCCESS' ? '✅' : '❌';
    const text = `${emoji} *${repo}* deployment ${status}\n\n${message}`;
    
    try {
        await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            chat_id: telegramChatId,
            text: text,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error('Failed to send notification:', error.message);
    }
}
```

---

## Complete Port Mapping

| Service | Port | Domain | Purpose |
|---------|------|--------|---------|
| Sistem Pondok | 3000 | tsn.ponpes.id | Main Next.js app |
| Radio TSN | 3001 | radio.tsn.ponpes.id | Radio Next.js app |
| PSB Subdomain | 3002 | psb.tsn.ponpes.id | PSB Next.js app |
| Gitea | 3000 | git.tsn.ponpes.id | Self-hosted Git |
| AzuraCast Web | 8080 | radio.tsn.ponpes.id | Radio streaming (proxied) |
| AzuraCast Streaming | 8000-8999 | - | Radio station streams |
| Webhook Service | 9000 | webhook.tsn.ponpes.id | Auto-deploy webhooks |
| Nginx | 80, 443 | - | Reverse proxy & SSL |
| SSH | 2222 | - | Secure shell access |
| PostgreSQL | 5432 | localhost | Database (internal) |

---

## Security Considerations

### Webhook Security

1. **Use strong secrets** for webhook signatures
2. **Verify signatures** on every request
3. **Use HTTPS** for all webhook endpoints
4. **Limit webhook IPs** in firewall (optional)
5. **Log all deployments** for audit trail

### Gitea Security

1. **Disable registration** if not needed
2. **Enable 2FA** for admin accounts
3. **Use SSH keys** for Git operations
4. **Regular backups** of Gitea database
5. **Keep Gitea updated**

### AzuraCast Security

1. **Change default passwords**
2. **Restrict admin access** by IP (optional)
3. **Regular backups** using `./docker.sh backup`
4. **Keep Docker images updated**
5. **Monitor resource usage**

---

## Maintenance Commands

### AzuraCast

```bash
cd /var/azuracast

# Update
./docker.sh update-self && ./docker.sh update

# Backup
./docker.sh backup

# Restore
./docker.sh restore backup-file.tar.gz

# View logs
./docker.sh logs
```

### Gitea

```bash
# Backup Gitea
sudo -u gitea /usr/local/bin/gitea dump -c /etc/gitea/app.ini

# Update Gitea
sudo systemctl stop gitea
sudo wget -O /usr/local/bin/gitea https://dl.gitea.com/gitea/1.21.5/gitea-1.21.5-linux-amd64
sudo chmod +x /usr/local/bin/gitea
sudo systemctl start gitea
```

### Webhook Service

```bash
# View deployment logs
tail -f /var/www/logs/webhook-deployments.log

# Restart webhook service
pm2 restart webhook-service

# Test webhook
curl -X POST https://webhook.tsn.ponpes.id/health
```

---

## Troubleshooting

### AzuraCast Issues

```bash
# Check Docker containers
docker ps -a

# View AzuraCast logs
cd /var/azuracast && ./docker.sh logs

# Restart AzuraCast
./docker.sh restart
```

### Gitea Issues

```bash
# Check Gitea status
sudo systemctl status gitea

# View Gitea logs
sudo journalctl -u gitea -f

# Restart Gitea
sudo systemctl restart gitea
```

### Webhook Deployment Issues

```bash
# Check webhook service
pm2 logs webhook-service

# Test deployment script manually
bash /var/www/sistem-pondok/deploy.sh

# Check webhook logs
tail -f /var/www/logs/webhook-deployments.log
```

---

**Your VPS now supports:**
- ✅ Multiple Next.js applications
- ✅ PHP applications (via PHP-FPM)
- ✅ AzuraCast radio streaming (Docker)
- ✅ Gitea self-hosted Git
- ✅ Automatic deployments via webhooks
- ✅ Complete SSL/TLS for all services
- ✅ Comprehensive security hardening
