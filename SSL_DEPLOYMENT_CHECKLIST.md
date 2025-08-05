# 🔥 Blue Fire Platform - SSL Deployment Checklist

## Server Information
- **Domain**: `app.bluefire.love`
- **Server IP**: `161.35.225.243`
- **Frontend Port**: `8080` (internal, proxied through Nginx on 80/443)
- **Backend Port**: `3001`

## ✅ Pre-Deployment Checklist

### 1. DNS Configuration
- [ ] Ensure `app.bluefire.love` points to `161.35.225.243`
- [ ] Wait for DNS propagation (check with `nslookup app.bluefire.love`)

### 2. Server Access
- [ ] SSH access to server: `ssh root@161.35.225.243`
- [ ] Server has Ubuntu/Debian OS
- [ ] Server has sudo/root privileges

### 3. Domain Verification
- [ ] Domain resolves correctly: `ping app.bluefire.love`
- [ ] Port 80 and 443 are open on firewall

## 🚀 Deployment Steps

### Step 1: Upload Files to Server
```bash
# From your local machine
scp deploy-ssl.sh root@161.35.225.243:/root/
scp -r . root@161.35.225.243:/var/www/bluefire/
```

### Step 2: Run SSL Setup
```bash
# On the server
ssh root@161.35.225.243
chmod +x /root/deploy-ssl.sh
./deploy-ssl.sh
```

### Step 3: Configure Environment Variables
```bash
# Frontend environment
cd /var/www/bluefire/frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://app.bluefire.love/api
EOF

# Backend environment (IMPORTANT: CORS configuration)
cd /var/www/bluefire/backend
cat > .env << 'EOF'
FRONTEND_URL=https://app.bluefire.love
PORT=3001
NODE_ENV=production
# Add your other production variables here
EOF
```

**🔒 CORS Configuration Note:**
The backend will automatically use `FRONTEND_URL=https://app.bluefire.love` for CORS origin, ensuring secure cross-origin requests work properly with SSL.

### Step 4: Build and Deploy Applications
```bash
# Build backend
cd /var/www/bluefire/backend
npm install
npm run build

# Start backend with PM2
pm2 start dist/main.js --name bluefire-api

# Build frontend
cd /var/www/bluefire/frontend
npm install
npm run build

# Start frontend with PM2
pm2 start npm --name bluefire-app -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔍 Testing & Verification

### SSL Certificate Test
- [ ] Visit `https://app.bluefire.love` (should show valid certificate)
- [ ] Check SSL grade: [SSL Labs Test](https://www.ssllabs.com/ssltest/)

### Application Test
- [ ] Frontend loads: `https://app.bluefire.love`
- [ ] API responds: `https://app.bluefire.love/api/health`
- [ ] Login/register functionality works
- [ ] All features function correctly

### Security Headers Test
```bash
curl -I https://app.bluefire.love
# Should include:
# - Strict-Transport-Security
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
```

## 🔧 Maintenance Commands

### Check SSL Certificate Status
```bash
sudo certbot certificates
```

### Renew SSL Certificate (manual)
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Check Application Status
```bash
pm2 status
pm2 logs bluefire-api
pm2 logs bluefire-app
```

### Nginx Management
```bash
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx      # Reload configuration
sudo tail -f /var/log/nginx/error.log  # Check logs
```

## 🆘 Troubleshooting

### SSL Issues
- **Certificate not found**: Check DNS propagation
- **Certificate expired**: Run `sudo certbot renew`
- **SSL test fails**: Check Nginx configuration

### Application Issues
- **502 Bad Gateway**: Check if applications are running with `pm2 status`
- **API not responding**: Check backend logs with `pm2 logs bluefire-api`
- **Frontend not loading**: Check frontend logs with `pm2 logs bluefire-app`

### Common Commands
```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx

# Check what's running on ports
sudo netstat -tlnp | grep :8080  # Frontend
sudo netstat -tlnp | grep :3001  # Backend API
sudo netstat -tlnp | grep :80    # Nginx HTTP
sudo netstat -tlnp | grep :443   # Nginx HTTPS
```

## 📊 Post-Deployment

### Security Monitoring
- [ ] Set up SSL expiry alerts
- [ ] Monitor certificate transparency logs
- [ ] Regular security updates

### Performance Monitoring
- [ ] Set up application monitoring
- [ ] Configure log rotation
- [ ] Monitor server resources

### Backup Strategy
- [ ] Database backups
- [ ] SSL certificate backups
- [ ] Application code backups

---

## 🎉 Success Criteria

✅ **SSL Setup Complete When:**
- `https://app.bluefire.love` loads with valid SSL certificate
- All HTTP traffic redirects to HTTPS
- API endpoints accessible via `https://app.bluefire.love/api/`
- Security headers present in responses
- SSL grade A or A+ on SSL Labs test

**Your Blue Fire Platform is now production-ready with SSL! 🔥🔒** 