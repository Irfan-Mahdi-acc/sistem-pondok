#!/bin/bash
# Startup script for Next.js Standalone on VPS
# This script ensures public folder is available to standalone build

# Navigate to project directory
cd /var/www/sistem-pondok

# Copy public folder to standalone build
echo "Copying public folder to standalone build..."
cp -r public .next/standalone/ 2>/dev/null || true

# Ensure uploads directory exists with proper permissions
echo "Setting up uploads directory..."
mkdir -p .next/standalone/public/uploads
chmod -R 755 .next/standalone/public/uploads

# Start the application
echo "Starting application..."
cd .next/standalone
node server.js
