# VPS Maintenance & Security Guide

Panduan lengkap untuk maintenance dan security check VPS Pondok Tadzimussunnah.

## 📋 Quick Start

```bash
# 1. Upload script (first time only)
scp vps-maintenance.sh root@srv1162705.hstgr.cloud:/root/
ssh root@srv1162705.hstgr.cloud "chmod +x /root/vps-maintenance.sh"

# 2. Run full check
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh full"
```

## 🛠️ Available Commands

| Command | Description | Safe to Auto-run |
|---------|-------------|------------------|
| `check` | System health check only | ✅ Yes |
| `security` | Security audit only | ✅ Yes |
| `app` | Application status check only | ✅ Yes |
| `update` | Update system packages | ⚠️ Requires confirmation |
| `restart` | Restart the VPS | ⚠️ Requires confirmation |
| `full` | Run all checks (recommended) | ✅ Yes |

## 📊 What Gets Monitored

### System Health
- **Disk Usage** - Alert if > 80%
- **Memory Usage** - Alert if > 80%
- **CPU Load** - Current load average
- **System Uptime** - How long server has been running
- **System Info** - OS version, kernel info

### Security Audit
- **SSH Configuration**
  - Root login status
  - Password authentication status
- **Firewall (UFW)**
  - Active/inactive status
  - Configured rules
- **Failed Login Attempts**
  - Last 10 failed SSH attempts
- **Active Sessions**
  - Currently logged in users
- **Open Ports**
  - All listening services
- **Security Updates**
  - Available security patches
- **Login History**
  - Last 10 successful logins

### Application Status
- **PM2 Processes**
  - Running/stopped status
  - Memory/CPU usage
  - Recent logs (last 20 lines)
- **Nginx**
  - Service status
  - Active/inactive
- **PostgreSQL**
  - Database service status
- **Application Files**
  - Git repository status
  - Uploads directory contents

## 🔒 Security Best Practices

### 1. SSH Hardening

```bash
# Edit SSH config
ssh root@srv1162705.hstgr.cloud "nano /etc/ssh/sshd_config"

# Recommended settings:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 22 # Consider changing to non-standard port

# Restart SSH service
ssh root@srv1162705.hstgr.cloud "systemctl restart sshd"
```

### 2. Firewall Configuration

```bash
# Enable UFW
ssh root@srv1162705.hstgr.cloud "ufw enable"

# Allow necessary ports
ssh root@srv1162705.hstgr.cloud "ufw allow 22/tcp"    # SSH
ssh root@srv1162705.hstgr.cloud "ufw allow 80/tcp"    # HTTP
ssh root@srv1162705.hstgr.cloud "ufw allow 443/tcp"   # HTTPS

# Check status
ssh root@srv1162705.hstgr.cloud "ufw status verbose"
```

### 3. Automatic Security Updates

```bash
# Install unattended-upgrades
ssh root@srv1162705.hstgr.cloud "apt install unattended-upgrades -y"

# Enable automatic security updates
ssh root@srv1162705.hstgr.cloud "dpkg-reconfigure -plow unattended-upgrades"
```

### 4. Fail2Ban (Brute Force Protection)

```bash
# Install Fail2Ban
ssh root@srv1162705.hstgr.cloud "apt install fail2ban -y"

# Check status
ssh root@srv1162705.hstgr.cloud "systemctl status fail2ban"

# View banned IPs
ssh root@srv1162705.hstgr.cloud "fail2ban-client status sshd"
```

## 📅 Recommended Maintenance Schedule

### Daily
- Run full system check
- Review PM2 logs for errors
- Check disk usage

```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh full"
```

### Weekly
- Review security audit
- Apply system updates if available
- Check for failed login attempts

```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh security"
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh update"
```

### Monthly
- Review and rotate logs
- Check database performance
- Backup verification
- Review user access

### As Needed
- Restart after critical updates
- Investigate security alerts
- Scale resources if needed

## 🚨 Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Disk Usage | > 80% | > 90% | Clean up logs, old files |
| Memory Usage | > 80% | > 90% | Restart services, upgrade RAM |
| CPU Load | > 70% | > 90% | Optimize code, scale up |
| Failed Logins | > 10/day | > 50/day | Enable Fail2Ban, review IPs |

## 🔧 Troubleshooting

### High Disk Usage

```bash
# Find large files
ssh root@srv1162705.hstgr.cloud "du -h /var/log | sort -rh | head -20"
ssh root@srv1162705.hstgr.cloud "du -h /var/www/sistem-pondok | sort -rh | head -20"

# Clean up logs
ssh root@srv1162705.hstgr.cloud "journalctl --vacuum-time=7d"
ssh root@srv1162705.hstgr.cloud "pm2 flush"
```

### High Memory Usage

```bash
# Check top processes
ssh root@srv1162705.hstgr.cloud "ps aux --sort=-%mem | head -10"

# Restart PM2 processes
ssh root@srv1162705.hstgr.cloud "pm2 restart all"
```

### Application Not Responding

```bash
# Check all services
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh app"

# Restart services
ssh root@srv1162705.hstgr.cloud "systemctl restart nginx"
ssh root@srv1162705.hstgr.cloud "pm2 restart all"

# Check logs
ssh root@srv1162705.hstgr.cloud "pm2 logs --lines 50"
ssh root@srv1162705.hstgr.cloud "tail -50 /var/log/nginx/error.log"
```

### Database Issues

```bash
# Check PostgreSQL status
ssh root@srv1162705.hstgr.cloud "systemctl status postgresql"

# Restart PostgreSQL
ssh root@srv1162705.hstgr.cloud "systemctl restart postgresql"

# Check connections
ssh root@srv1162705.hstgr.cloud "sudo -u postgres psql -c 'SELECT count(*) FROM pg_stat_activity;'"
```

## 📝 Logs Location

| Service | Log Location |
|---------|--------------|
| Nginx Access | `/var/log/nginx/access.log` |
| Nginx Error | `/var/log/nginx/error.log` |
| PM2 | `~/.pm2/logs/` |
| System | `/var/log/syslog` |
| Auth | `/var/log/auth.log` |
| PostgreSQL | `/var/log/postgresql/` |

## 🔐 Security Checklist

- [ ] Root login disabled in SSH
- [ ] Password authentication disabled (SSH keys only)
- [ ] UFW firewall enabled and configured
- [ ] Fail2Ban installed and active
- [ ] Automatic security updates enabled
- [ ] Regular backups configured
- [ ] SSL/TLS certificates valid
- [ ] No unnecessary open ports
- [ ] Strong passwords for all accounts
- [ ] Regular security audits performed

## 📞 Emergency Contacts

- **Hostinger Support:** https://www.hostinger.com/cpanel-login
- **VPS IP:** 72.61.210.79
- **Domain:** tsn.ponpes.id

## 🔄 Update History

| Date | Action | Notes |
|------|--------|-------|
| 2025-12-14 | Initial setup | Created maintenance script and documentation |

---

**Last Updated:** 2025-12-14  
**Maintained By:** System Administrator
