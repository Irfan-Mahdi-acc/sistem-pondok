# VPS Multi-Application Setup Guide

Panduan lengkap untuk setup VPS dengan multi-aplikasi, keamanan maksimal, dan auto-deployment.

## 📚 Dokumentasi

### Panduan Utama
- **[VPS-MULTI-APP-SETUP-GUIDE.md](VPS-MULTI-APP-SETUP-GUIDE.md)** - Panduan lengkap 10 fase setup VPS
- **[VPS-EXTENDED-SETUP.md](VPS-EXTENDED-SETUP.md)** - PHP, AzuraCast, Gitea, dan Auto-Deploy
- **[VPS-QUICK-REFERENCE.md](VPS-QUICK-REFERENCE.md)** - Quick reference untuk operasional harian
- **[VPS-REINSTALL-SECURITY-GUIDE.md](VPS-REINSTALL-SECURITY-GUIDE.md)** - Security hardening guide

### Panduan Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide untuk aplikasi Next.js

## 🔧 Scripts & Automation

### Deployment Scripts
- **[deploy-multi-app.sh](deploy-multi-app.sh)** - Deploy satu atau semua aplikasi
- **[ecosystem-multi-app.config.js](ecosystem-multi-app.config.js)** - PM2 configuration untuk multiple apps

### Backup & Monitoring
- **[backup-all.sh](backup-all.sh)** - Comprehensive backup automation
- **[vps-health-check.sh](vps-health-check.sh)** - VPS health monitoring

### Auto-Deploy System
- **[webhook-service.js](webhook-service.js)** - Gitea webhook receiver service
- **[webhook-package.json](webhook-package.json)** - Dependencies untuk webhook service

## 🌐 Supported Services

### Next.js Applications
- Sistem Pondok (Main App)
- Radio TSN
- PSB Subdomain

### Additional Services
- **PHP-FPM** - PHP application support
- **AzuraCast** - Docker-based radio streaming
- **Gitea** - Self-hosted Git server
- **Webhook Service** - Auto-deployment system

## 🚀 Quick Start

### 1. VPS Fresh Install
```bash
# Follow VPS-MULTI-APP-SETUP-GUIDE.md Phase 1-4
# - Backup data
# - Reinstall Ubuntu 22.04 LTS
# - Security hardening
# - Install application stack
```

### 2. Deploy Applications
```bash
# Clone repositories
cd /var/www
git clone <repo-url> sistem-pondok

# Setup and deploy
cd sistem-pondok
npm install
npm run build
pm2 start ecosystem.config.js
```

### 3. Setup Auto-Deploy
```bash
# Install Gitea
# Follow VPS-EXTENDED-SETUP.md Phase 13

# Setup webhook service
# Follow VPS-EXTENDED-SETUP.md Phase 14
```

## 📊 Architecture

```
VPS Server
├── Next.js Apps (Port 3000-3002)
├── AzuraCast (Docker, Port 8080)
├── Gitea (Binary, Port 3000)
├── Webhook Service (Port 9000)
├── Nginx (Port 80, 443)
└── PostgreSQL (Port 5432)
```

## 🔐 Security Features

- SSH key-only authentication
- Custom SSH port (2222)
- UFW firewall
- Fail2Ban intrusion detection
- SSL/TLS for all services
- Upload directory protection
- Automatic security updates
- ClamAV antivirus
- AIDE file integrity monitoring

## 📝 Domain Mapping

| Domain | Service | Port |
|--------|---------|------|
| tsn.ponpes.id | Sistem Pondok | 3000 |
| radio.tsn.ponpes.id | AzuraCast | 8080 |
| git.tsn.ponpes.id | Gitea | 3000 |
| webhook.tsn.ponpes.id | Webhook Service | 9000 |
| psb.tsn.ponpes.id | PSB App | 3002 |

## 🛠️ Maintenance

### Daily
```bash
pm2 status
./vps-health-check.sh
```

### Weekly
```bash
./backup-all.sh
sudo apt update && sudo apt upgrade
```

### Monthly
```bash
# Update services
cd /var/azuracast && ./docker.sh update
# Update Gitea binary
# Review security logs
```

## 📞 Support

- **Documentation**: Lihat file MD di folder ini
- **Scripts**: Semua automation scripts tersedia
- **Configuration**: Contoh konfigurasi Nginx, PM2, dll

## 📄 License

MIT License - Free to use and modify

---

**Created for**: Pondok Tadzimussunnah  
**Last Updated**: December 2025
