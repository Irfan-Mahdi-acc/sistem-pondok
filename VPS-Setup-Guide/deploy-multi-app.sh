#!/bin/bash
# deploy-multi-app.sh - Deployment script for multiple applications
# This script can deploy individual apps or all apps at once

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_DIR="/var/www"
APPS=("sistem-pondok" "radio-tsn" "psb-subdomain")

# Function to display usage
usage() {
    echo "Usage: $0 [app-name|all]"
    echo ""
    echo "Available apps:"
    for app in "${APPS[@]}"; do
        echo "  - $app"
    done
    echo "  - all (deploy all applications)"
    echo ""
    echo "Examples:"
    echo "  $0 sistem-pondok    # Deploy only sistem-pondok"
    echo "  $0 all              # Deploy all applications"
    exit 1
}

# Function to deploy a single application
deploy_app() {
    local APP_NAME=$1
    local APP_DIR="$BASE_DIR/$APP_NAME"
    
    echo ""
    echo "================================"
    echo -e "${BLUE}🚀 Deploying: $APP_NAME${NC}"
    echo "================================"
    
    # Check if app directory exists
    if [ ! -d "$APP_DIR" ]; then
        echo -e "${RED}❌ Error: Directory $APP_DIR not found${NC}"
        return 1
    fi
    
    cd "$APP_DIR"
    
    # Step 1: Git Pull
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    if git pull origin main; then
        echo -e "${GREEN}✅ Git pull successful${NC}"
    else
        echo -e "${RED}❌ Git pull failed${NC}"
        return 1
    fi
    
    # Step 2: Install Dependencies
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    if npm install; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ npm install failed${NC}"
        return 1
    fi
    
    # Step 3: Database Migration (if Prisma exists)
    if [ -f "prisma/schema.prisma" ]; then
        echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
        if npx prisma migrate deploy && npx prisma generate; then
            echo -e "${GREEN}✅ Database migrations completed${NC}"
        else
            echo -e "${RED}❌ Database migration failed${NC}"
            return 1
        fi
    fi
    
    # Step 4: Build Application
    echo -e "${YELLOW}🏗️  Building application...${NC}"
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    fi
    
    # Step 5: Copy Static Files (for Next.js standalone)
    if [ -d ".next/standalone" ]; then
        echo -e "${YELLOW}📂 Copying static files...${NC}"
        
        # Copy static assets
        if [ -d ".next/static" ]; then
            mkdir -p .next/standalone/.next
            cp -r .next/static .next/standalone/.next/
            echo -e "${GREEN}✅ Static assets copied${NC}"
        fi
        
        # Copy public folder
        if [ -d "public" ]; then
            cp -r public .next/standalone/
            mkdir -p .next/standalone/public/uploads
            chmod -R 755 .next/standalone/public
            echo -e "${GREEN}✅ Public folder copied${NC}"
        fi
    fi
    
    # Step 6: Create logs directory
    mkdir -p logs
    chmod -R 755 logs
    
    # Step 7: Restart PM2
    echo -e "${YELLOW}🔄 Restarting application...${NC}"
    if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
        pm2 restart "$APP_NAME"
    else
        echo -e "${YELLOW}⚠️  PM2 process not found, please start manually${NC}"
    fi
    
    echo -e "${GREEN}✅ $APP_NAME deployed successfully!${NC}"
    return 0
}

# Main script
main() {
    if [ $# -eq 0 ]; then
        usage
    fi
    
    TARGET=$1
    
    echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Multi-Application Deployment     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
    
    if [ "$TARGET" == "all" ]; then
        # Deploy all applications
        FAILED_APPS=()
        
        for app in "${APPS[@]}"; do
            if ! deploy_app "$app"; then
                FAILED_APPS+=("$app")
            fi
        done
        
        echo ""
        echo "================================"
        echo -e "${BLUE}📊 Deployment Summary${NC}"
        echo "================================"
        
        if [ ${#FAILED_APPS[@]} -eq 0 ]; then
            echo -e "${GREEN}✅ All applications deployed successfully!${NC}"
        else
            echo -e "${RED}❌ Failed deployments:${NC}"
            for app in "${FAILED_APPS[@]}"; do
                echo -e "${RED}  - $app${NC}"
            done
        fi
        
        # Show PM2 status
        echo ""
        pm2 status
        
    else
        # Deploy single application
        if [[ " ${APPS[@]} " =~ " ${TARGET} " ]]; then
            deploy_app "$TARGET"
            echo ""
            pm2 status "$TARGET"
        else
            echo -e "${RED}❌ Error: Unknown application '$TARGET'${NC}"
            usage
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📝 To view logs: pm2 logs [app-name]${NC}"
    echo -e "${BLUE}📊 To monitor: pm2 monit${NC}"
}

# Run main function
main "$@"
