#!/bin/bash
# Fix 404 Error for Uploaded Images
# Run this script on VPS

echo "=== Fixing Upload 404 Error ==="
echo ""

# Navigate to project directory
cd /var/www/sistem-pondok

echo "1. Checking uploads directory..."
if [ -d "public/uploads" ]; then
    echo "✅ Directory exists"
    ls -la public/uploads/
else
    echo "❌ Directory does not exist. Creating..."
    mkdir -p public/uploads
fi

echo ""
echo "2. Setting correct permissions..."
chmod 755 public/uploads
chown -R www-data:www-data public/uploads
echo "✅ Permissions set"

echo ""
echo "3. Checking uploaded files..."
file_count=$(ls -1 public/uploads/ 2>/dev/null | wc -l)
echo "Found $file_count files in uploads directory"

if [ $file_count -gt 0 ]; then
    echo "Latest files:"
    ls -lht public/uploads/ | head -5
fi

echo ""
echo "4. Checking if file 1765714115698-y9rdt8tg5u.png exists..."
if [ -f "public/uploads/1765714115698-y9rdt8tg5u.png" ]; then
    echo "✅ File exists"
    ls -lh public/uploads/1765714115698-y9rdt8tg5u.png
else
    echo "❌ File not found"
fi

echo ""
echo "5. Restarting application..."
pm2 restart sistem-pondok
echo "✅ Application restarted"

echo ""
echo "6. Testing file access..."
echo "Try accessing: https://tsn.ponpes.id/uploads/1765714115698-y9rdt8tg5u.png"

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Next steps:"
echo "1. Try uploading a new image"
echo "2. Check if preview displays correctly"
echo "3. If still 404, check nginx logs: tail -f /var/log/nginx/error.log"
