#!/bin/bash
# debug-vps.sh - Check VPS file structure for debugging

echo "🔍 Checking VPS File Structure..."
echo "================================="

PROJECT_DIR="/var/www/sistem-pondok"
cd "$PROJECT_DIR" || { echo "❌ Project directory not found"; exit 1; }

echo "📂 Checking .next/standalone structure:"
if [ -d ".next/standalone" ]; then
    echo "✅ .next/standalone exists"
    
    echo "Checking .next/standalone/.next/static:"
    if [ -d ".next/standalone/.next/static" ]; then
        echo "✅ .next/standalone/.next/static exists"
        echo "   File count: $(find .next/standalone/.next/static -type f | wc -l)"
        ls -la .next/standalone/.next/static | head -n 5
    else
        echo "❌ .next/standalone/.next/static MISSING"
    fi

    echo "Checking .next/standalone/public:"
    if [ -d ".next/standalone/public" ]; then
        echo "✅ .next/standalone/public exists"
    else
        echo "❌ .next/standalone/public MISSING"
    fi
else
    echo "❌ .next/standalone MISSING"
fi

echo ""
echo "📂 Checking PM2 Status:"
pm2 describe web | grep "status"
pm2 describe web | grep "script"

echo ""
echo "================================="
echo "Done."
