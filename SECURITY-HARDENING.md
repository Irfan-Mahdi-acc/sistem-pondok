# Security Hardening Checklist & Best Practices

Comprehensive security guide for maintaining a secure production environment.

---

## 🔒 File Upload Security

### Current Implementation

✅ **Magic Bytes Validation**
- Validates actual file content, not just extension
- Prevents spoofed file types
- Supports: JPEG, PNG, GIF, WebP, SVG

✅ **Extension Whitelist**
- Only allows: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- Blocks executable files: `.php`, `.sh`, `.exe`, etc.

✅ **MIME Type Verification**
- Cross-checks MIME type with detected file type
- Prevents MIME type spoofing

✅ **SVG XSS Protection**
- Scans SVG files for dangerous content
- Blocks: `<script>`, `javascript:`, event handlers, `<iframe>`, etc.

✅ **File Size Limits**
- Maximum: 5MB per file
- Prevents DoS attacks via large files

✅ **Secure Filename Generation**
- Removes original filename
- Uses timestamp + random string
- Only uses validated extension

### Nginx Upload Protection

✅ **Script Execution Disabled**
```nginx
location ~* ^/uploads/.*\.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi|exe)$ {
    deny all;
    return 403;
}
```

✅ **MIME Type Enforcement**
- Only serves image MIME types
- Blocks execution of any scripts

✅ **Security Headers**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 🛡️ SSH Security

### Essential Configurations

- [ ] **Disable Root Login**
  ```bash
  PermitRootLogin no
  ```

- [ ] **Disable Password Authentication**
  ```bash
  PasswordAuthentication no
  PubkeyAuthentication yes
  ```

- [ ] **Change Default Port**
  ```bash
  Port 2222  # Or any non-standard port
  ```

- [ ] **Use SSH Keys Only**
  ```bash
  # Generate strong key
  ssh-keygen -t ed25519 -C "your-email@example.com"
  ```

- [ ] **Install Fail2Ban**
  ```bash
  sudo apt install fail2ban
  ```

### SSH Best Practices

1. **Use Strong Key Types**
   - Prefer: `ed25519` or `rsa` (4096 bits)
   - Avoid: `dsa`, weak `rsa` keys

2. **Limit User Access**
   ```bash
   AllowUsers deploy
   ```

3. **Set Login Grace Time**
   ```bash
   LoginGraceTime 30
   ```

4. **Limit Authentication Attempts**
   ```bash
   MaxAuthTries 3
   ```

---

## 🔥 Firewall Configuration

### UFW (Uncomplicated Firewall)

```bash
# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow necessary ports
sudo ufw allow 2222/tcp  # SSH (custom port)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

### Advanced Rules

```bash
# Rate limiting for SSH
sudo ufw limit 2222/tcp

# Allow from specific IP only
sudo ufw allow from YOUR_IP_ADDRESS to any port 2222

# Block specific IP
sudo ufw deny from MALICIOUS_IP
```

---

## 🗄️ Database Security

### PostgreSQL Hardening

- [ ] **Use Strong Passwords**
  ```bash
  # Generate strong password
  openssl rand -base64 32
  ```

- [ ] **Limit Network Access**
  ```bash
  # /etc/postgresql/14/main/pg_hba.conf
  # Only allow local connections
  local   all             all                                     md5
  host    all             all             127.0.0.1/32            md5
  ```

- [ ] **Disable Remote Access** (if not needed)
  ```bash
  # /etc/postgresql/14/main/postgresql.conf
  listen_addresses = 'localhost'
  ```

- [ ] **Regular Backups**
  ```bash
  # Daily automated backups
  pg_dump -U postgres sistem_pondok > backup_$(date +%Y%m%d).sql
  ```

- [ ] **Encrypt Connections**
  ```bash
  # Enable SSL in postgresql.conf
  ssl = on
  ```

### Database Best Practices

1. **Use Connection Pooling**
   - Prevents connection exhaustion
   - Improves performance

2. **Limit User Privileges**
   ```sql
   -- Create app-specific user
   CREATE USER app_user WITH PASSWORD 'strong_password';
   GRANT CONNECT ON DATABASE sistem_pondok TO app_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
   ```

3. **Monitor Query Performance**
   ```sql
   -- Enable logging
   log_statement = 'all'
   log_duration = on
   ```

---

## 🔐 Environment Variables Security

### Critical Rules

❌ **NEVER commit `.env` to Git**
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

✅ **Use Strong Secrets**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 16
```

✅ **Rotate Credentials Regularly**
- Change passwords every 90 days
- Rotate API keys quarterly
- Update OAuth secrets annually

✅ **Use Different Credentials Per Environment**
- Development ≠ Staging ≠ Production
- Never reuse passwords

### Environment Variable Checklist

- [ ] `DATABASE_URL` - Strong password, localhost only
- [ ] `NEXTAUTH_SECRET` - 32+ character random string
- [ ] `NEXTAUTH_URL` - Correct production URL
- [ ] `GOOGLE_CLIENT_ID` - Restricted to production domain
- [ ] `GOOGLE_CLIENT_SECRET` - Kept secure
- [ ] `ENCRYPTION_KEY` - 32 character hex string
- [ ] `NODE_ENV` - Set to "production"

---

## 🌐 Nginx Security

### Security Headers

```nginx
# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Enable XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

# Hide nginx version
server_tokens off;
```

### Rate Limiting

```nginx
# Define rate limit zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# Apply to API endpoints
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... rest of config
}

# Apply to login endpoint
location /api/auth/signin {
    limit_req zone=login_limit burst=3 nodelay;
    # ... rest of config
}
```

### SSL/TLS Configuration

```nginx
# SSL protocols
ssl_protocols TLSv1.2 TLSv1.3;

# SSL ciphers
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

# Prefer server ciphers
ssl_prefer_server_ciphers on;

# SSL session cache
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## 📊 Monitoring & Logging

### Log Monitoring

```bash
# Monitor nginx access logs
sudo tail -f /var/log/nginx/access.log

# Monitor nginx error logs
sudo tail -f /var/log/nginx/error.log

# Monitor application logs
pm2 logs sistem-pondok

# Monitor system logs
sudo journalctl -f
```

### Security Monitoring

```bash
# Check failed login attempts
sudo grep "Failed password" /var/log/auth.log

# Check fail2ban status
sudo fail2ban-client status sshd

# Check firewall logs
sudo tail -f /var/log/ufw.log

# Check for suspicious processes
ps aux | grep -E 'php|perl|python' | grep -v grep
```

### Automated Alerts

```bash
# Install logwatch
sudo apt install logwatch

# Configure daily email reports
sudo nano /etc/cron.daily/00logwatch
```

Add:
```bash
#!/bin/bash
/usr/sbin/logwatch --output mail --mailto your-email@example.com --detail high
```

---

## 🦠 Malware Prevention

### ClamAV Antivirus

```bash
# Install ClamAV
sudo apt install clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Scan uploads directory
sudo clamscan -r -i /var/www/sistem-pondok/public/uploads/

# Automated daily scan
sudo crontab -e
# Add: 0 2 * * * clamscan -r -i /var/www/sistem-pondok/public/uploads/ >> /var/log/clamav-scan.log
```

### File Integrity Monitoring (AIDE)

```bash
# Install AIDE
sudo apt install aide

# Initialize database
sudo aideinit

# Check for changes
sudo aide --check

# Update database after legitimate changes
sudo aide --update
```

### Suspicious File Detection

```bash
# Find recently modified files
find /var/www/sistem-pondok -type f -mtime -1 -ls

# Find files with suspicious permissions
find /var/www/sistem-pondok -type f -perm 0777

# Find PHP files in uploads (should be none!)
find /var/www/sistem-pondok/public/uploads -name "*.php"

# Find files owned by www-data (potential uploads)
find /var/www/sistem-pondok -user www-data -type f
```

---

## 🔄 Update Management

### Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure (optional)
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

### Manual Updates

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Upgrade distribution
sudo apt dist-upgrade -y

# Remove unused packages
sudo apt autoremove -y

# Clean package cache
sudo apt clean
```

### Application Updates

```bash
# Update Node.js packages
cd /var/www/sistem-pondok
npm outdated
npm update

# Update global packages
npm update -g

# Check for security vulnerabilities
npm audit
npm audit fix
```

---

## 🚨 Incident Response Plan

### If You Suspect a Breach

1. **Isolate the System**
   ```bash
   # Block all incoming traffic except your IP
   sudo ufw default deny incoming
   sudo ufw allow from YOUR_IP
   ```

2. **Preserve Evidence**
   ```bash
   # Backup logs
   sudo tar -czf incident-logs-$(date +%Y%m%d).tar.gz /var/log/
   
   # Backup current state
   sudo tar -czf incident-www-$(date +%Y%m%d).tar.gz /var/www/
   ```

3. **Investigate**
   ```bash
   # Check active connections
   sudo netstat -tulpn
   
   # Check running processes
   ps aux
   
   # Check cron jobs
   sudo crontab -l
   sudo cat /etc/crontab
   
   # Check for backdoors
   find /var/www -name "*.php" -exec grep -l "eval\|base64_decode\|system\|exec" {} \;
   ```

4. **Clean & Restore**
   - Follow VPS-REINSTALL-SECURITY-GUIDE.md
   - Restore from known-good backup
   - Change all credentials

5. **Post-Incident**
   - Document what happened
   - Update security measures
   - Monitor closely for 30 days

---

## 📋 Regular Maintenance Schedule

### Daily
- [ ] Check PM2 application status
- [ ] Review application logs for errors
- [ ] Monitor disk space usage

### Weekly
- [ ] Review nginx access logs for anomalies
- [ ] Check fail2ban ban list
- [ ] Review ClamAV scan results
- [ ] Test database backups

### Monthly
- [ ] Update system packages
- [ ] Review and rotate logs
- [ ] Check SSL certificate expiry
- [ ] Review user access and permissions
- [ ] Test disaster recovery procedures

### Quarterly
- [ ] Rotate API keys and secrets
- [ ] Security audit of application code
- [ ] Review and update firewall rules
- [ ] Penetration testing (if budget allows)

### Annually
- [ ] Full security assessment
- [ ] Update disaster recovery plan
- [ ] Review and update security policies
- [ ] Staff security training

---

## 🎯 Security Testing

### Test File Upload Security

```bash
# Try to upload PHP file (should fail)
# Create test file
echo "<?php phpinfo(); ?>" > test.php

# Try to upload via application
# Should be rejected: "File type not recognized"

# Try to upload with spoofed MIME type
# Should be rejected: "MIME type mismatch"
```

### Test Nginx Security

```bash
# Try to access PHP file in uploads (should 403)
curl -I https://tsn.ponpes.id/uploads/test.php

# Check security headers
curl -I https://tsn.ponpes.id | grep -E 'X-Content-Type-Options|X-Frame-Options|X-XSS-Protection'

# Test rate limiting
for i in {1..20}; do curl https://tsn.ponpes.id/api/test; done
```

### Test SSH Security

```bash
# Try password authentication (should fail)
ssh -o PubkeyAuthentication=no deploy@your-vps-ip -p 2222

# Try root login (should fail)
ssh root@your-vps-ip -p 2222

# Check fail2ban is working
# After 3 failed attempts, IP should be banned
```

---

## 📚 Additional Resources

### Security Tools
- **OWASP ZAP**: Web application security scanner
- **Nmap**: Network security scanner
- **Lynis**: Security auditing tool
- **Rkhunter**: Rootkit detection

### Learning Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [Ubuntu Security Guide](https://ubuntu.com/security)
- [Nginx Security Guide](https://nginx.org/en/docs/http/ngx_http_core_module.html#security)

### Security Newsletters
- [SANS NewsBites](https://www.sans.org/newsletters/newsbites/)
- [Krebs on Security](https://krebsonsecurity.com/)
- [The Hacker News](https://thehackernews.com/)

---

> [!IMPORTANT]
> **Security is an Ongoing Process**
> 
> - Stay informed about new vulnerabilities
> - Keep all software updated
> - Monitor logs regularly
> - Test your backups
> - Have an incident response plan
> 
> **Security is not a one-time setup, it's a continuous commitment!**
