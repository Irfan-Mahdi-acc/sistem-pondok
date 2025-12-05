#!/bin/bash
# domain-migration.sh - Script untuk migrasi ke domain tsn.ponpes.id
# Run this script on VPS after DNS is configured

set -e

echo "🌐 Domain Migration Script for tsn.ponpes.id"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DOMAIN="tsn.ponpes.id"
VPS_IP="72.61.210.79"
PROJECT_DIR="/var/www/sistem-pondok"

# Step 1: Verify DNS
echo -e "${YELLOW}Step 1: Verifying DNS configuration...${NC}"
DNS_IP=$(dig +short $DOMAIN | tail -n1)

if [ "$DNS_IP" == "$VPS_IP" ]; then
    echo -e "${GREEN}✅ DNS correctly points to $VPS_IP${NC}"
else
    echo -e "${RED}❌ DNS issue: $DOMAIN points to $DNS_IP instead of $VPS_IP${NC}"
    echo "Please configure DNS A record first!"
    exit 1
fi
echo ""

# Step 2: Install Nginx
echo -e "${YELLOW}Step 2: Installing Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✅ Nginx already installed${NC}"
else
    sudo apt update
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installed${NC}"
fi
echo ""

# Step 3: Configure Nginx
echo -e "${YELLOW}Step 3: Configuring Nginx...${NC}"

# Create Nginx config
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 10M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log /var/log/nginx/$DOMAIN.error.log;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx configured${NC}"
echo ""

# Step 4: Test HTTP access
echo -e "${YELLOW}Step 4: Testing HTTP access...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ HTTP access working (http://$DOMAIN)${NC}"
else
    echo -e "${RED}❌ HTTP access failed (Status: $HTTP_STATUS)${NC}"
    echo "Check if Next.js is running: pm2 status"
    exit 1
fi
echo ""

# Step 5: Install Certbot
echo -e "${YELLOW}Step 5: Installing Certbot...${NC}"
if command -v certbot &> /dev/null; then
    echo -e "${GREEN}✅ Certbot already installed${NC}"
else
    sudo apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✅ Certbot installed${NC}"
fi
echo ""

# Step 6: Obtain SSL Certificate
echo -e "${YELLOW}Step 6: Obtaining SSL certificate...${NC}"
echo "This will ask for your email and agreement to terms..."
echo ""

sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate obtained${NC}"
else
    echo -e "${RED}❌ SSL certificate failed${NC}"
    echo "You may need to run certbot manually:"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    exit 1
fi
echo ""

# Step 7: Update Environment Variables
echo -e "${YELLOW}Step 7: Updating environment variables...${NC}"
cd $PROJECT_DIR

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update NEXTAUTH_URL
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|g" .env

# Add NEXTAUTH_URL_INTERNAL if not exists
if ! grep -q "NEXTAUTH_URL_INTERNAL" .env; then
    echo "NEXTAUTH_URL_INTERNAL=http://localhost:3000" >> .env
fi

echo -e "${GREEN}✅ Environment variables updated${NC}"
echo ""

# Step 8: Restart Application
echo -e "${YELLOW}Step 8: Restarting application...${NC}"
pm2 restart web
pm2 save

echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Step 9: Test HTTPS
echo -e "${YELLOW}Step 9: Testing HTTPS access...${NC}"
sleep 3

HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)

if [ "$HTTPS_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ HTTPS access working (https://$DOMAIN)${NC}"
else
    echo -e "${RED}❌ HTTPS access failed (Status: $HTTPS_STATUS)${NC}"
fi
echo ""

# Step 10: Configure Firewall
echo -e "${YELLOW}Step 10: Configuring firewall...${NC}"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}🎉 Domain Migration Completed!${NC}"
echo ""
echo "📋 Summary:"
echo "  - Domain: https://$DOMAIN"
echo "  - SSL: Enabled (Let's Encrypt)"
echo "  - Auto-renewal: Configured"
echo ""
echo "⚠️  IMPORTANT: Update Google OAuth Settings"
echo "  1. Go to: https://console.cloud.google.com/"
echo "  2. Navigate to: APIs & Services → Credentials"
echo "  3. Add to Authorized JavaScript origins:"
echo "     https://$DOMAIN"
echo "  4. Add to Authorized redirect URIs:"
echo "     https://$DOMAIN/api/auth/callback/google"
echo ""
echo "🔍 Verification:"
echo "  - Visit: https://$DOMAIN"
echo "  - Check SSL certificate (green padlock)"
echo "  - Test login with Google OAuth"
echo ""
echo "📝 Logs:"
echo "  - Nginx: sudo tail -f /var/log/nginx/$DOMAIN.error.log"
echo "  - App: pm2 logs web"
echo ""
