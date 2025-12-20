# VPS Multi-Application Quick Reference

## 🚀 Quick Start Commands

### Initial Setup (One-time)
```bash
# After VPS reinstall, run these in order:
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw fail2ban

# Create deploy user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Setup SSH keys (from local machine)
ssh-copy-id -p 2222 deploy@your-vps-ip
```

### Application Deployment

```bash
# Deploy single application
./deploy-multi-app.sh sistem-pondok

# Deploy all applications
./deploy-multi-app.sh all

# Manual deployment for specific app
cd /var/www/sistem-pondok
git pull && npm install && npm run build
pm2 restart sistem-pondok
```

### PM2 Management

```bash
# Start all applications
pm2 start /var/www/ecosystem-multi-app.config.js

# Restart all
pm2 restart all

# Restart specific app
pm2 restart sistem-pondok

# Stop all
pm2 stop all

# View logs
pm2 logs                    # All apps
pm2 logs sistem-pondok      # Specific app
pm2 logs --lines 100        # Last 100 lines

# Monitor
pm2 monit

# Status
pm2 status

# Save configuration
pm2 save
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload (no downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/sistem-pondok-access.log

# Check which sites are enabled
ls -la /etc/nginx/sites-enabled/
```

### Database Operations

```bash
# Connect to database
psql -U postgres -d sistem_pondok

# List all databases
psql -U postgres -c "\l"

# Backup single database
pg_dump -U postgres sistem_pondok > backup.sql

# Backup all databases
pg_dumpall -U postgres > all_databases.sql

# Restore database
psql -U postgres -d sistem_pondok < backup.sql

# Run automated backup
./backup-all.sh
```

### SSL Certificate Management

```bash
# Get new certificate
sudo certbot --nginx -d tsn.ponpes.id

# Get certificate for multiple domains
sudo certbot --nginx -d tsn.ponpes.id -d radio.tsn.ponpes.id -d psb.tsn.ponpes.id

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates
```

### Security & Monitoring

```bash
# Check firewall status
sudo ufw status verbose

# Allow port
sudo ufw allow 443/tcp

# Check fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd

# Unban IP
sudo fail2ban-client set sshd unbanip 192.168.1.1

# Run health check
./vps-health-check.sh

# View system resources
htop
df -h
free -h
```

### System Services

```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status fail2ban

# Start service
sudo systemctl start nginx

# Stop service
sudo systemctl stop nginx

# Restart service
sudo systemctl restart nginx

# Enable on boot
sudo systemctl enable nginx
```

## 📁 Important File Locations

### Application Files
```
/var/www/sistem-pondok/          # Main application
/var/www/radio-tsn/              # Radio application
/var/www/psb-subdomain/          # PSB application
/var/www/logs/                   # Application logs
```

### Configuration Files
```
/etc/nginx/nginx.conf                        # Main Nginx config
/etc/nginx/sites-available/sistem-pondok    # Site configs
/etc/nginx/sites-enabled/                   # Enabled sites
/var/www/ecosystem-multi-app.config.js      # PM2 config
/etc/ssh/sshd_config                        # SSH config
/etc/fail2ban/jail.local                    # Fail2ban config
```

### Log Files
```
/var/log/nginx/error.log                    # Nginx errors
/var/log/nginx/sistem-pondok-access.log     # App access logs
/var/www/logs/sistem-pondok-error.log       # PM2 app errors
/var/log/postgresql/postgresql-14-main.log  # PostgreSQL logs
/var/log/auth.log                           # SSH/auth logs
```

### Backup Location
```
/home/deploy/backups/databases/   # Database backups
/home/deploy/backups/configs/     # Config backups
/home/deploy/backups/uploads/     # Upload backups
```

## 🔧 Common Tasks

### Add New Application

1. **Create directory:**
   ```bash
   mkdir -p /var/www/new-app
   cd /var/www/new-app
   git clone <repo-url> .
   ```

2. **Setup environment:**
   ```bash
   nano .env
   # Add environment variables
   ```

3. **Install & build:**
   ```bash
   npm install
   npx prisma generate
   npm run build
   cp -r .next/static .next/standalone/.next/
   cp -r public .next/standalone/
   ```

4. **Add to PM2 config:**
   ```bash
   nano /var/www/ecosystem-multi-app.config.js
   # Add new app configuration
   ```

5. **Create Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/new-app
   # Add server configuration
   sudo ln -s /etc/nginx/sites-available/new-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d new-app.tsn.ponpes.id
   ```

7. **Start application:**
   ```bash
   pm2 start /var/www/ecosystem-multi-app.config.js
   pm2 save
   ```

### Update Application

```bash
cd /var/www/sistem-pondok
git pull
npm install
npx prisma migrate deploy
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
pm2 restart sistem-pondok
pm2 logs sistem-pondok
```

### Restore from Backup

```bash
# Restore database
cd /home/deploy/backups/databases
gunzip -c sistem_pondok_20241218.sql.gz | psql -U postgres -d sistem_pondok

# Restore environment files
cd /home/deploy/backups/configs
cp .env.sistem-pondok_20241218 /var/www/sistem-pondok/.env

# Restore uploads
cd /home/deploy/backups/uploads
tar -xzf sistem-pondok_uploads_20241218.tar.gz -C /
```

### Check Application Health

```bash
# Quick check
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Detailed check
./vps-health-check.sh

# Check specific app logs
pm2 logs sistem-pondok --lines 50

# Check Nginx logs
sudo tail -f /var/log/nginx/sistem-pondok-error.log

# Check database connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🆘 Troubleshooting Quick Fixes

### Application won't start
```bash
pm2 logs sistem-pondok --lines 100
pm2 restart sistem-pondok
# Check if port is in use
sudo lsof -i :3000
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status
# Restart app
pm2 restart sistem-pondok
# Check Nginx config
sudo nginx -t
```

### Database connection failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
# Test connection
psql -U postgres -d sistem_pondok
# Check .env file
cat /var/www/sistem-pondok/.env | grep DATABASE_URL
```

### SSL certificate expired
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### High memory usage
```bash
# Check which app is using memory
pm2 status
# Restart high-memory app
pm2 restart sistem-pondok
# Check for memory leaks
pm2 monit
```

### Disk space full
```bash
# Check disk usage
df -h
# Clean old logs
sudo journalctl --vacuum-time=7d
# Clean old backups
find /home/deploy/backups -mtime +7 -delete
# Clean npm cache
npm cache clean --force
```

## 📊 Monitoring Commands

```bash
# Real-time monitoring
htop                    # System resources
pm2 monit              # PM2 applications
sudo iotop             # Disk I/O

# Check logs
sudo tail -f /var/log/nginx/error.log
pm2 logs --lines 100
sudo journalctl -f

# Network monitoring
sudo ss -tulpn         # Open ports
sudo netstat -an       # Network connections
```

## 🔐 Security Checklist

```bash
# Daily
./vps-health-check.sh

# Weekly
sudo fail2ban-client status
sudo ufw status
sudo certbot certificates

# Monthly
sudo apt update && sudo apt upgrade
./backup-all.sh
```

## 📞 Emergency Contacts

- **Hostinger Support:** https://www.hostinger.com/support
- **VPS IP:** your-vps-ip
- **SSH Port:** 2222
- **Deploy User:** deploy

## 🔗 Useful Links

- Main App: https://tsn.ponpes.id
- Radio: https://radio.tsn.ponpes.id
- PSB: https://psb.tsn.ponpes.id
- PM2 Docs: https://pm2.keymetrics.io/docs/
- Nginx Docs: https://nginx.org/en/docs/
- PostgreSQL Docs: https://www.postgresql.org/docs/
