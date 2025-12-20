#!/bin/bash
# backup-all.sh - Comprehensive backup script for all VPS data
# Creates backups of databases, configurations, and uploaded files

set -e

# Configuration
BACKUP_BASE="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VPS Comprehensive Backup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
echo ""

# Create backup directories
mkdir -p "$BACKUP_BASE/databases"
mkdir -p "$BACKUP_BASE/configs"
mkdir -p "$BACKUP_BASE/uploads"

# 1. Backup All Databases
echo -e "${YELLOW}🗄️  Backing up databases...${NC}"

# Backup all databases
pg_dumpall -U postgres > "$BACKUP_BASE/databases/all_databases_$DATE.sql"

# Backup individual databases
DATABASES=("sistem_pondok" "radio_tsn")
for db in "${DATABASES[@]}"; do
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$db"; then
        pg_dump -U postgres "$db" > "$BACKUP_BASE/databases/${db}_$DATE.sql"
        echo -e "${GREEN}✅ Backed up: $db${NC}"
    fi
done

# Compress database backups
gzip "$BACKUP_BASE/databases"/*_$DATE.sql
echo -e "${GREEN}✅ Database backups compressed${NC}"

# 2. Backup Environment Files
echo -e "${YELLOW}📝 Backing up environment files...${NC}"

find /var/www -name ".env" | while read file; do
    app_name=$(echo $file | sed 's/\/var\/www\///g' | sed 's/\//.env./g')
    cp "$file" "$BACKUP_BASE/configs/${app_name}_$DATE"
done

echo -e "${GREEN}✅ Environment files backed up${NC}"

# 3. Backup Nginx Configurations
echo -e "${YELLOW}🌐 Backing up Nginx configurations...${NC}"

tar -czf "$BACKUP_BASE/configs/nginx_$DATE.tar.gz" \
    /etc/nginx/sites-available/ \
    /etc/nginx/sites-enabled/ \
    /etc/nginx/nginx.conf

echo -e "${GREEN}✅ Nginx configurations backed up${NC}"

# 4. Backup PM2 Configuration
echo -e "${YELLOW}⚙️  Backing up PM2 configurations...${NC}"

if [ -f "/var/www/ecosystem.config.js" ]; then
    cp /var/www/ecosystem.config.js "$BACKUP_BASE/configs/ecosystem_$DATE.config.js"
fi

pm2 save
cp ~/.pm2/dump.pm2 "$BACKUP_BASE/configs/pm2_dump_$DATE.pm2" 2>/dev/null || true

echo -e "${GREEN}✅ PM2 configurations backed up${NC}"

# 5. Backup Uploaded Files (Optional - can be large)
echo -e "${YELLOW}📁 Backing up uploaded files...${NC}"

UPLOAD_DIRS=(
    "/var/www/sistem-pondok/.next/standalone/public/uploads"
    "/var/www/radio-tsn/public/uploads"
    "/var/www/psb-subdomain/public/uploads"
)

for dir in "${UPLOAD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        app_name=$(basename $(dirname $(dirname $dir)))
        tar -czf "$BACKUP_BASE/uploads/${app_name}_uploads_$DATE.tar.gz" "$dir"
        echo -e "${GREEN}✅ Backed up uploads: $app_name${NC}"
    fi
done

# 6. Create backup manifest
echo -e "${YELLOW}📋 Creating backup manifest...${NC}"

cat > "$BACKUP_BASE/manifest_$DATE.txt" << EOF
VPS Backup Manifest
===================
Date: $(date)
Hostname: $(hostname)

Databases Backed Up:
$(ls -lh "$BACKUP_BASE/databases"/*_$DATE.sql.gz 2>/dev/null || echo "None")

Configurations Backed Up:
$(ls -lh "$BACKUP_BASE/configs"/*_$DATE* 2>/dev/null || echo "None")

Uploads Backed Up:
$(ls -lh "$BACKUP_BASE/uploads"/*_$DATE.tar.gz 2>/dev/null || echo "None")

Total Backup Size:
$(du -sh "$BACKUP_BASE" | cut -f1)
EOF

echo -e "${GREEN}✅ Backup manifest created${NC}"

# 7. Cleanup old backups
echo -e "${YELLOW}🧹 Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"

find "$BACKUP_BASE/databases" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_BASE/configs" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_BASE/uploads" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_BASE" -name "manifest_*.txt" -mtime +$RETENTION_DAYS -delete

echo -e "${GREEN}✅ Old backups cleaned up${NC}"

# 8. Display summary
echo ""
echo "================================"
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo "================================"
echo ""
echo "Backup Location: $BACKUP_BASE"
echo "Backup Date: $DATE"
echo ""
echo "Backup Contents:"
echo "  - Databases: $(ls "$BACKUP_BASE/databases"/*_$DATE.sql.gz 2>/dev/null | wc -l) files"
echo "  - Configs: $(ls "$BACKUP_BASE/configs"/*_$DATE* 2>/dev/null | wc -l) files"
echo "  - Uploads: $(ls "$BACKUP_BASE/uploads"/*_$DATE.tar.gz 2>/dev/null | wc -l) files"
echo ""
echo "Total Size: $(du -sh "$BACKUP_BASE" | cut -f1)"
echo ""
echo "To restore a database:"
echo "  psql -U postgres -d database_name < backup.sql"
echo ""

# Log backup completion
echo "Backup completed at $(date)" >> "$BACKUP_BASE/backup.log"
