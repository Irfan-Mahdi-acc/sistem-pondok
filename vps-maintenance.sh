#!/bin/bash

# VPS Maintenance & Security Check Script
# Usage: ./vps-maintenance.sh [check|update|restart|full]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function: System Health Check
system_health_check() {
    print_header "SYSTEM HEALTH CHECK"
    
    echo "📊 System Information:"
    echo "-------------------"
    uname -a
    echo ""
    
    echo "💾 Disk Usage:"
    echo "-------------------"
    df -h | grep -E '^Filesystem|^/dev/'
    echo ""
    
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 80 ]; then
        print_warning "Disk usage is above 80%: ${DISK_USAGE}%"
    else
        print_success "Disk usage is healthy: ${DISK_USAGE}%"
    fi
    echo ""
    
    echo "🧠 Memory Usage:"
    echo "-------------------"
    free -h
    echo ""
    
    MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$MEM_USAGE" -gt 80 ]; then
        print_warning "Memory usage is above 80%: ${MEM_USAGE}%"
    else
        print_success "Memory usage is healthy: ${MEM_USAGE}%"
    fi
    echo ""
    
    echo "⚡ CPU Load:"
    echo "-------------------"
    uptime
    echo ""
    
    echo "🔄 System Uptime:"
    echo "-------------------"
    uptime -p
    echo ""
}

# Function: Security Check
security_check() {
    print_header "SECURITY CHECK"
    
    echo "🔐 SSH Configuration:"
    echo "-------------------"
    if grep -q "^PermitRootLogin no" /etc/ssh/sshd_config 2>/dev/null; then
        print_success "Root login is disabled"
    else
        print_warning "Root login is enabled (consider disabling)"
    fi
    
    if grep -q "^PasswordAuthentication no" /etc/ssh/sshd_config 2>/dev/null; then
        print_success "Password authentication is disabled"
    else
        print_warning "Password authentication is enabled (consider using SSH keys only)"
    fi
    echo ""
    
    echo "🔥 Firewall Status (UFW):"
    echo "-------------------"
    if command -v ufw &> /dev/null; then
        ufw status
        if ufw status | grep -q "Status: active"; then
            print_success "Firewall is active"
        else
            print_warning "Firewall is inactive"
        fi
    else
        print_warning "UFW is not installed"
    fi
    echo ""
    
    echo "🚨 Failed Login Attempts (Last 10):"
    echo "-------------------"
    if [ -f /var/log/auth.log ]; then
        grep "Failed password" /var/log/auth.log | tail -10 || echo "No failed login attempts found"
    else
        echo "Auth log not available"
    fi
    echo ""
    
    echo "👥 Active SSH Sessions:"
    echo "-------------------"
    who
    echo ""
    
    echo "🔒 Open Ports:"
    echo "-------------------"
    ss -tulpn | grep LISTEN
    echo ""
    
    echo "🛡️ Security Updates Available:"
    echo "-------------------"
    apt list --upgradable 2>/dev/null | grep -i security || echo "No security updates available"
    echo ""
    
    echo "📝 Last Logins:"
    echo "-------------------"
    last -n 10
    echo ""
}

# Function: Application Status Check
app_status_check() {
    print_header "APPLICATION STATUS CHECK"
    
    echo "🚀 PM2 Processes:"
    echo "-------------------"
    if command -v pm2 &> /dev/null; then
        pm2 status
        echo ""
        pm2 logs --lines 20 --nostream
    else
        print_error "PM2 is not installed"
    fi
    echo ""
    
    echo "🌐 Nginx Status:"
    echo "-------------------"
    systemctl status nginx --no-pager
    echo ""
    
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi
    echo ""
    
    echo "🗄️ PostgreSQL Status:"
    echo "-------------------"
    systemctl status postgresql --no-pager || echo "PostgreSQL status check failed"
    echo ""
    
    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
    fi
    echo ""
    
    echo "📁 Application Directory:"
    echo "-------------------"
    if [ -d "/var/www/sistem-pondok" ]; then
        cd /var/www/sistem-pondok
        print_success "Application directory exists"
        echo ""
        echo "Git Status:"
        git status || echo "Not a git repository"
        echo ""
        echo "Uploads Directory:"
        ls -lh public/uploads/ 2>/dev/null | head -10 || echo "Uploads directory not found"
    else
        print_error "Application directory not found"
    fi
    echo ""
}

# Function: System Updates
system_update() {
    print_header "SYSTEM UPDATE"
    
    print_warning "This will update all system packages..."
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Updating package list..."
        apt update
        echo ""
        
        echo "⬆️ Upgradable packages:"
        apt list --upgradable
        echo ""
        
        echo "🔧 Installing updates..."
        apt upgrade -y
        echo ""
        
        echo "🧹 Cleaning up..."
        apt autoremove -y
        apt autoclean
        echo ""
        
        print_success "System updated successfully"
        
        if [ -f /var/run/reboot-required ]; then
            print_warning "System restart is required!"
            echo "Run: ./vps-maintenance.sh restart"
        fi
    else
        echo "Update cancelled"
    fi
}

# Function: System Restart
system_restart() {
    print_header "SYSTEM RESTART"
    
    print_warning "This will restart the VPS server..."
    read -p "Are you sure? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Restarting in 10 seconds... (Ctrl+C to cancel)"
        sleep 10
        reboot
    else
        echo "Restart cancelled"
    fi
}

# Function: Full Maintenance
full_maintenance() {
    system_health_check
    security_check
    app_status_check
    
    print_header "MAINTENANCE SUMMARY"
    
    if [ -f /var/run/reboot-required ]; then
        print_warning "System restart is required"
    fi
    
    UPDATES=$(apt list --upgradable 2>/dev/null | wc -l)
    if [ "$UPDATES" -gt 1 ]; then
        print_warning "$((UPDATES-1)) updates available"
    else
        print_success "System is up to date"
    fi
}

# Main script
case "${1:-check}" in
    check)
        system_health_check
        ;;
    security)
        security_check
        ;;
    app)
        app_status_check
        ;;
    update)
        system_update
        ;;
    restart)
        system_restart
        ;;
    full)
        full_maintenance
        ;;
    *)
        echo "Usage: $0 {check|security|app|update|restart|full}"
        echo ""
        echo "Commands:"
        echo "  check    - System health check only"
        echo "  security - Security audit only"
        echo "  app      - Application status check only"
        echo "  update   - Update system packages"
        echo "  restart  - Restart the VPS"
        echo "  full     - Run all checks (health + security + app)"
        exit 1
        ;;
esac
