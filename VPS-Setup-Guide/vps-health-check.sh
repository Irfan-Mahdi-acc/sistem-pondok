#!/bin/bash
# vps-health-check.sh - Comprehensive VPS health monitoring script
# Checks system resources, services, applications, and security status

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=85

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VPS Health Check Report           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
echo ""
echo "Generated: $(date)"
echo "Hostname: $(hostname)"
echo ""

# 1. System Resources
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. System Resources${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
CPU_USAGE_INT=${CPU_USAGE%.*}

echo -n "CPU Usage: $CPU_USAGE% "
if [ "$CPU_USAGE_INT" -lt "$CPU_THRESHOLD" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}⚠️  HIGH${NC}"
fi

# Memory Usage
MEMORY_USAGE=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
MEMORY_USAGE_INT=${MEMORY_USAGE%.*}

echo -n "Memory Usage: $MEMORY_USAGE% "
if [ "$MEMORY_USAGE_INT" -lt "$MEMORY_THRESHOLD" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}⚠️  HIGH${NC}"
fi

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

echo -n "Disk Usage: $DISK_USAGE% "
if [ "$DISK_USAGE" -lt "$DISK_THRESHOLD" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}⚠️  HIGH${NC}"
fi

# Load Average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
echo "Load Average:$LOAD_AVG"

echo ""

# 2. Core Services Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Core Services${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        echo -e "$service: ${GREEN}✅ Running${NC}"
    else
        echo -e "$service: ${RED}❌ Stopped${NC}"
    fi
}

check_service "nginx"
check_service "postgresql"
check_service "fail2ban"
check_service "ufw"

echo ""

# 3. PM2 Applications
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. PM2 Applications${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v pm2 &> /dev/null; then
    pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status) (CPU: \(.monit.cpu)%, Memory: \(.monit.memory / 1024 / 1024 | floor)MB)"' 2>/dev/null || pm2 status
else
    echo -e "${RED}PM2 not installed${NC}"
fi

echo ""

# 4. Database Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. Database Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v psql &> /dev/null; then
    # List databases
    echo "Databases:"
    sudo -u postgres psql -c "\l" | grep -E "sistem_pondok|radio_tsn" || echo "No application databases found"
    
    # Database size
    echo ""
    echo "Database Sizes:"
    sudo -u postgres psql -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database WHERE datname IN ('sistem_pondok', 'radio_tsn');" 2>/dev/null || echo "Unable to retrieve sizes"
else
    echo -e "${RED}PostgreSQL not installed${NC}"
fi

echo ""

# 5. Security Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Security Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Firewall status
echo -n "Firewall (UFW): "
if sudo ufw status | grep -q "Status: active"; then
    echo -e "${GREEN}✅ Active${NC}"
else
    echo -e "${RED}❌ Inactive${NC}"
fi

# Fail2Ban status
echo -n "Fail2Ban: "
if sudo fail2ban-client status &> /dev/null; then
    BANNED_IPS=$(sudo fail2ban-client status sshd 2>/dev/null | grep "Currently banned" | awk '{print $4}')
    echo -e "${GREEN}✅ Active${NC} (Banned IPs: $BANNED_IPS)"
else
    echo -e "${RED}❌ Not running${NC}"
fi

# SSL Certificates
echo ""
echo "SSL Certificates:"
if command -v certbot &> /dev/null; then
    sudo certbot certificates 2>/dev/null | grep -E "Certificate Name|Expiry Date" || echo "No certificates found"
else
    echo "Certbot not installed"
fi

echo ""

# 6. Network Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. Network Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Open ports
echo "Listening Ports:"
sudo ss -tulpn | grep LISTEN | awk '{print $5, $7}' | column -t

echo ""

# 7. Recent Errors
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. Recent Errors (Last 24 hours)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Nginx errors
NGINX_ERRORS=$(sudo grep -i error /var/log/nginx/error.log 2>/dev/null | tail -5 | wc -l)
echo "Nginx Errors: $NGINX_ERRORS"

# PostgreSQL errors
PSQL_ERRORS=$(sudo grep -i error /var/log/postgresql/postgresql-*.log 2>/dev/null | tail -5 | wc -l)
echo "PostgreSQL Errors: $PSQL_ERRORS"

# System errors
SYSTEM_ERRORS=$(sudo journalctl -p err -S "24 hours ago" --no-pager | wc -l)
echo "System Errors: $SYSTEM_ERRORS"

echo ""

# 8. Disk Space Details
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8. Disk Space Details${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

df -h | grep -E "Filesystem|/$|/var|/home"

echo ""

# 9. Last Backup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}9. Backup Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

BACKUP_DIR="/home/deploy/backups"
if [ -d "$BACKUP_DIR" ]; then
    LAST_BACKUP=$(ls -t "$BACKUP_DIR"/databases/*.sql.gz 2>/dev/null | head -1)
    if [ -n "$LAST_BACKUP" ]; then
        echo "Last Database Backup: $(basename $LAST_BACKUP)"
        echo "Backup Date: $(stat -c %y "$LAST_BACKUP" | cut -d' ' -f1)"
        echo "Backup Size: $(du -h "$LAST_BACKUP" | cut -f1)"
    else
        echo -e "${YELLOW}⚠️  No backups found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backup directory not found${NC}"
fi

echo ""

# 10. Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}10. Health Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

ISSUES=0

# Check for issues
if [ "$CPU_USAGE_INT" -ge "$CPU_THRESHOLD" ]; then
    echo -e "${RED}⚠️  High CPU usage detected${NC}"
    ((ISSUES++))
fi

if [ "$MEMORY_USAGE_INT" -ge "$MEMORY_THRESHOLD" ]; then
    echo -e "${RED}⚠️  High memory usage detected${NC}"
    ((ISSUES++))
fi

if [ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]; then
    echo -e "${RED}⚠️  High disk usage detected${NC}"
    ((ISSUES++))
fi

if ! systemctl is-active --quiet nginx; then
    echo -e "${RED}⚠️  Nginx is not running${NC}"
    ((ISSUES++))
fi

if ! systemctl is-active --quiet postgresql; then
    echo -e "${RED}⚠️  PostgreSQL is not running${NC}"
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All systems operational${NC}"
else
    echo -e "${YELLOW}⚠️  $ISSUES issue(s) detected${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Health check completed at $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
