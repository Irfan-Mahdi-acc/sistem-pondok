#!/bin/bash
# vps-static-diagnostic.sh - Diagnose static asset serving issues on VPS
# Run this script on your VPS to identify the root cause of 404 errors

set -e

echo "🔍 VPS Static Asset Diagnostic Tool"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/sistem-pondok"

# Check 1: Project directory exists
echo -e "${BLUE}[1/7] Checking project directory...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅ Project directory exists: $PROJECT_DIR${NC}"
else
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi
echo ""

# Check 2: Standalone build exists
echo -e "${BLUE}[2/7] Checking standalone build...${NC}"
if [ -f "$PROJECT_DIR/.next/standalone/server.js" ]; then
    echo -e "${GREEN}✅ Standalone server.js exists${NC}"
else
    echo -e "${RED}❌ Standalone server.js not found${NC}"
    echo "Run: npm run build"
    exit 1
fi
echo ""

# Check 3: Static files in standalone
echo -e "${BLUE}[3/7] Checking static files in standalone build...${NC}"
STATIC_DIR="$PROJECT_DIR/.next/standalone/.next/static"
if [ -d "$STATIC_DIR" ]; then
    FILE_COUNT=$(find "$STATIC_DIR" -type f | wc -l)
    echo -e "${GREEN}✅ Static directory exists with $FILE_COUNT files${NC}"
    echo "   Path: $STATIC_DIR"
    
    # Show sample files
    echo "   Sample files:"
    find "$STATIC_DIR" -type f | head -5 | while read file; do
        echo "   - ${file#$PROJECT_DIR/}"
    done
else
    echo -e "${RED}❌ Static directory not found: $STATIC_DIR${NC}"
    echo "The deploy script should copy .next/static to .next/standalone/.next/"
    echo "Run: cp -r .next/static .next/standalone/.next/"
fi
echo ""

# Check 4: File permissions
echo -e "${BLUE}[4/7] Checking file permissions...${NC}"
if [ -d "$STATIC_DIR" ]; then
    PERMS=$(stat -c "%a" "$STATIC_DIR" 2>/dev/null || stat -f "%OLp" "$STATIC_DIR" 2>/dev/null)
    echo "   Static directory permissions: $PERMS"
    
    # Check if readable
    if [ -r "$STATIC_DIR" ]; then
        echo -e "${GREEN}✅ Static directory is readable${NC}"
    else
        echo -e "${RED}❌ Static directory is not readable${NC}"
        echo "Run: chmod -R 755 .next/standalone/.next/static"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (static directory not found)${NC}"
fi
echo ""

# Check 5: Nginx configuration
echo -e "${BLUE}[5/7] Checking Nginx configuration...${NC}"
NGINX_CONF="/etc/nginx/sites-enabled/sistem-pondok"
if [ -f "$NGINX_CONF" ]; then
    echo -e "${GREEN}✅ Nginx config exists: $NGINX_CONF${NC}"
    
    # Check for _next/static location block
    if grep -q "location /_next/static" "$NGINX_CONF"; then
        echo -e "${GREEN}✅ Found /_next/static location block${NC}"
        echo "   Configuration:"
        grep -A 5 "location /_next/static" "$NGINX_CONF" | sed 's/^/   /'
    else
        echo -e "${RED}❌ Missing /_next/static location block${NC}"
        echo "   This is likely the cause of 404 errors!"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx config not found at expected location${NC}"
    echo "   Searching for Nginx configs..."
    find /etc/nginx -name "*.conf" -o -name "sistem-pondok" 2>/dev/null | head -5
fi
echo ""

# Check 6: MIME types
echo -e "${BLUE}[6/7] Checking Nginx MIME types...${NC}"
if [ -f "/etc/nginx/mime.types" ]; then
    echo -e "${GREEN}✅ MIME types file exists${NC}"
    
    # Check for JavaScript and CSS MIME types
    if grep -q "application/javascript" "/etc/nginx/mime.types"; then
        echo -e "${GREEN}✅ JavaScript MIME type configured${NC}"
    else
        echo -e "${RED}❌ JavaScript MIME type missing${NC}"
    fi
    
    if grep -q "text/css" "/etc/nginx/mime.types"; then
        echo -e "${GREEN}✅ CSS MIME type configured${NC}"
    else
        echo -e "${RED}❌ CSS MIME type missing${NC}"
    fi
else
    echo -e "${RED}❌ MIME types file not found${NC}"
fi
echo ""

# Check 7: PM2 process
echo -e "${BLUE}[7/7] Checking PM2 process...${NC}"
if command -v pm2 &> /dev/null; then
    if pm2 describe web &> /dev/null; then
        echo -e "${GREEN}✅ PM2 process 'web' is running${NC}"
        pm2 describe web | grep -E "status|restart time|uptime" | sed 's/^/   /'
    else
        echo -e "${RED}❌ PM2 process 'web' not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not installed${NC}"
fi
echo ""

# Summary
echo "===================================="
echo -e "${BLUE}📋 DIAGNOSTIC SUMMARY${NC}"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. If static files are missing, run the deployment script"
echo "2. If Nginx config is missing /_next/static block, apply nginx-static-fix.conf"
echo "3. If permissions are wrong, run: chmod -R 755 .next/standalone"
echo "4. After fixes, reload Nginx: sudo systemctl reload nginx"
echo ""
