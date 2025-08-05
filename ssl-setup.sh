#!/bin/bash

# Blue Fire Platform - SSL Setup Script
# Run this script on your server to set up SSL with Let's Encrypt

set -e

echo "🔥 Blue Fire Platform SSL Setup"
echo "================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Blue Fire Platform - predefined domain
DOMAIN="app.bluefire.love"
read -p "Enter your email for Let's Encrypt notifications: " EMAIL

echo "🔥 Setting up SSL for: $DOMAIN"

echo "📦 Installing required packages..."

# Update package list
apt update

# Install Nginx
apt install -y nginx

# Install Certbot
apt install -y certbot python3-certbot-nginx

echo "🔧 Configuring Nginx..."

# Create Nginx configuration
cat > /etc/nginx/sites-available/bluefire << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Temporary location for Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect other traffic to HTTPS (will be added after SSL setup)
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/bluefire /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo "🔒 Obtaining SSL certificate..."

# Get SSL certificate
certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email

echo "📝 Updating Nginx configuration with SSL and proxy settings..."

# Update Nginx configuration with full SSL setup
cat > /etc/nginx/sites-available/bluefire << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL Certificate paths
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

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
                 proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Backend API (NestJS)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Test and reload Nginx
nginx -t
systemctl reload nginx

echo "⚙️  Setting up auto-renewal..."

# Test auto-renewal
certbot renew --dry-run

echo "✅ SSL Setup Complete!"
echo ""
echo "🎉 Your Blue Fire Platform is now secured with SSL!"
echo "🌐 Access your site at: https://$DOMAIN"
echo "🔧 API endpoint: https://$DOMAIN/api/"
echo ""
echo "📋 Next steps:"
echo "1. Update your environment variables:"
echo "   Frontend: NEXT_PUBLIC_API_URL=https://$DOMAIN/api"
echo "   Backend: FRONTEND_URL=https://$DOMAIN"
echo ""
echo "2. Start your applications:"
echo "   cd backend && npm run start:prod"
echo "   cd frontend && npm run build && npm start"
echo ""
echo "🔄 SSL certificates will auto-renew via cron job" 