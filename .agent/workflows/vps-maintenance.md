---
description: VPS Maintenance & Security Check
---

# VPS Maintenance & Security Check Workflow

Workflow ini digunakan untuk melakukan maintenance rutin dan security check pada VPS.

## Prerequisites

1. SSH access ke VPS (root@srv1162705.hstgr.cloud)
2. Script `vps-maintenance.sh` sudah di-upload ke VPS

## Steps

### 1. Upload Script ke VPS (First Time Only)

```bash
scp vps-maintenance.sh root@srv1162705.hstgr.cloud:/root/
```

### 2. Set Permissions

```bash
ssh root@srv1162705.hstgr.cloud "chmod +x /root/vps-maintenance.sh"
```

### 3. Run Full System Check

Jalankan semua checks (health + security + application):

// turbo
```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh full"
```

### 4. Run Individual Checks (Optional)

**System Health Check Only:**
```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh check"
```

**Security Audit Only:**
```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh security"
```

**Application Status Only:**
```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh app"
```

### 5. Update System (If Needed)

Jika ada updates yang tersedia:

```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh update"
```

⚠️ **Note:** Ini akan meminta konfirmasi sebelum melakukan update.

### 6. Restart System (If Required)

Jika system restart diperlukan (biasanya setelah update):

```bash
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh restart"
```

⚠️ **Warning:** Ini akan restart VPS dan meminta konfirmasi.

## What Gets Checked

### System Health Check
- ✅ Disk usage (warning jika > 80%)
- ✅ Memory usage (warning jika > 80%)
- ✅ CPU load
- ✅ System uptime
- ✅ System information

### Security Check
- ✅ SSH configuration (root login, password auth)
- ✅ Firewall status (UFW)
- ✅ Failed login attempts
- ✅ Active SSH sessions
- ✅ Open ports
- ✅ Security updates available
- ✅ Last login history

### Application Status Check
- ✅ PM2 processes status
- ✅ PM2 logs (last 20 lines)
- ✅ Nginx status
- ✅ PostgreSQL status
- ✅ Git repository status
- ✅ Uploads directory

## Recommended Schedule

- **Daily:** Run `full` check
- **Weekly:** Run `update` if updates available
- **Monthly:** Review security audit results
- **As Needed:** Run `restart` after critical updates

## Troubleshooting

### Script Not Found
```bash
# Re-upload the script
scp vps-maintenance.sh root@srv1162705.hstgr.cloud:/root/
ssh root@srv1162705.hstgr.cloud "chmod +x /root/vps-maintenance.sh"
```

### Permission Denied
```bash
ssh root@srv1162705.hstgr.cloud "chmod +x /root/vps-maintenance.sh"
```

### Services Not Running
```bash
# Check specific service
ssh root@srv1162705.hstgr.cloud "systemctl status nginx"
ssh root@srv1162705.hstgr.cloud "systemctl status postgresql"
ssh root@srv1162705.hstgr.cloud "pm2 status"

# Restart services if needed
ssh root@srv1162705.hstgr.cloud "systemctl restart nginx"
ssh root@srv1162705.hstgr.cloud "pm2 restart all"
```

## Security Recommendations

Based on the security check, consider:

1. **Disable Root Login:** Edit `/etc/ssh/sshd_config` and set `PermitRootLogin no`
2. **Use SSH Keys Only:** Set `PasswordAuthentication no` in SSH config
3. **Enable Firewall:** Run `ufw enable` and configure necessary ports
4. **Regular Updates:** Run updates weekly or enable automatic security updates
5. **Monitor Failed Logins:** Check for suspicious login attempts regularly

## Quick Reference

```bash
# Full check
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh full"

# Update system
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh update"

# Restart VPS
ssh root@srv1162705.hstgr.cloud "/root/vps-maintenance.sh restart"
```
