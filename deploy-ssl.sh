#!/bin/bash

# Blue Fire Platform - SSL Deployment Script
# Run this on your server (161.35.225.243) to deploy with SSL

set -e

echo "🔥 Blue Fire Platform - SSL Deployment"
echo "======================================="
echo "Domain: app.bluefire.love"
echo "Server: 161.35.225.243"
echo "Frontend Port: 8080 (internal) | Backend Port: 3001"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Get email for Let's Encrypt
read -p "Enter your email for Let's Encrypt notifications: " EMAIL

echo "📦 Step 1: Installing dependencies..."
apt update
apt install -y nginx certbot python3-certbot-nginx

echo "🔧 Step 2: Setting up Nginx configuration..."

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create Blue Fire Nginx config
cat > /etc/nginx/sites-available/bluefire << 'EOF'
server {
    listen 80;
    server_name app.bluefire.love;
    
    # Temporary location for Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect other traffic to HTTPS (will be updated after SSL)
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/bluefire /etc/nginx/sites-enabled/

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "🔒 Step 3: Obtaining SSL certificate..."
certbot --nginx -d app.bluefire.love --email $EMAIL --agree-tos --no-eff-email

echo "📝 Step 4: Updating Nginx with full SSL configuration..."

# Update with full SSL configuration
cat > /etc/nginx/sites-available/bluefire << 'EOF'
server {
    listen 80;
    server_name app.bluefire.love;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.bluefire.love;

    # SSL Certificate paths
    ssl_certificate /etc/letsencrypt/live/app.bluefire.love/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.bluefire.love/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Backend API (NestJS)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Test and reload Nginx
nginx -t
systemctl reload nginx

echo "🎯 Step 5: Setting up PM2 for process management..."
npm install -g pm2

echo "✅ SSL Setup Complete!"
echo ""
echo "🎉 Next steps to complete deployment:"
echo ""
echo "1. 📁 Upload/clone your Blue Fire Platform code anywhere on the server"
echo "   Example: git clone your-repo /home/jorge/blue-fire-platform"
echo ""
echo "2. 📝 Update environment variables:"
echo "   Frontend (.env.local):"
echo "   NEXT_PUBLIC_API_URL=https://app.bluefire.love/api"
echo ""
echo "   Backend (.env):"
echo "   FRONTEND_URL=https://app.bluefire.love"
echo "   PORT=3001"
echo "   NODE_ENV=production"
echo ""
echo "3. 🚀 Build and start applications (from your code directory):"
echo "   cd your-code-directory/backend"
echo "   npm install && npm run build"
echo "   pm2 start dist/main.js --name bluefire-api"
echo ""
echo "   cd ../frontend"
echo "   npm install && npm run build"
echo "   pm2 start 'npm start' --name bluefire-app"
echo ""
echo "4. 💾 Save PM2 configuration:"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "5. 🔍 Test your site:"
echo "   https://app.bluefire.love"
echo ""
echo "🔄 SSL certificates will auto-renew via cron job"
echo "🔥 Your Blue Fire Platform is ready for production!" 