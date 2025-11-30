#!/bin/bash
# deploy-vps.sh - Complete deployment script for VPS
# This script handles the entire deployment process from git pull to server restart

set -e  # Exit on error

echo "🚀 Starting VPS Deployment..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory (adjust if needed)
PROJECT_DIR="/var/www/sistem-pondok"

# Navigate to project directory
cd "$PROJECT_DIR" || { echo -e "${RED}❌ Project directory not found${NC}"; exit 1; }

# Step 1: Git Pull
echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
git pull origin main || { echo -e "${RED}❌ Git pull failed${NC}"; exit 1; }
echo -e "${GREEN}✅ Git pull successful${NC}"
echo ""

# Step 2: Install Dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install || { echo -e "${RED}❌ npm install failed${NC}"; exit 1; }
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Database Migration
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy || { echo -e "${RED}❌ Database migration failed${NC}"; exit 1; }
npx prisma generate || { echo -e "${RED}❌ Prisma generate failed${NC}"; exit 1; }
echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Step 4: Build Application
echo -e "${YELLOW}🏗️  Building Next.js application...${NC}"
npm run build || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 5: Copy Static Files
echo -e "${YELLOW}📂 Copying static files to standalone build...${NC}"
cp -r public .next/standalone/ 2>/dev/null || true
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# Verify static files were copied
if [ -d ".next/standalone/.next/static" ]; then
    STATIC_COUNT=$(find .next/standalone/.next/static -type f | wc -l)
    echo -e "${GREEN}✅ Static files copied ($STATIC_COUNT files)${NC}"
else
    echo -e "${RED}❌ Warning: Static files directory not found!${NC}"
    echo "This may cause 404 errors for CSS/JS files"
fi
echo ""

# Step 6: Create logs directory
echo -e "${YELLOW}📝 Setting up logs directory...${NC}"
mkdir -p logs
chmod -R 755 logs
echo -e "${GREEN}✅ Logs directory ready${NC}"
echo ""

# Step 7: Restart Application with PM2
echo -e "${YELLOW}🔄 Restarting application...${NC}"

# Check if PM2 process exists
if pm2 describe web > /dev/null 2>&1; then
    echo "Restarting existing PM2 process..."
    pm2 restart ecosystem.config.js --update-env
else
    echo "Starting new PM2 process..."
    pm2 start ecosystem.config.js
fi

pm2 save
echo -e "${GREEN}✅ Application restarted${NC}"
echo ""

# Step 8: Health Check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 3

if pm2 describe web | grep -q "online"; then
    echo -e "${GREEN}✅ Application is running${NC}"
else
    echo -e "${RED}❌ Application failed to start${NC}"
    echo "Showing recent logs:"
    pm2 logs web --lines 20 --nostream
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "📝 To view logs, run: pm2 logs web"
echo "📊 To monitor, run: pm2 monit"
