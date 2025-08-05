# SSL Setup Guide - Blue Fire Platform

This guide covers the best SSL/TLS setup options for your Blue Fire Platform, from easiest to most advanced.

## 🏆 Option 1: Cloud Platform SSL (Recommended)

### ✅ **Best for: Production deployments, easiest setup**

**Frontend on Vercel:**
```bash
# Deploy frontend
npm run build
vercel --prod

# Automatic SSL included ✅
# Custom domain SSL: vercel domains add your-domain.com
```

**Backend on Railway/Render:**
```bash
# Deploy backend
railway login
railway link
railway up

# SSL automatically provided ✅
```

**Environment Configuration:**
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Backend .env
FRONTEND_URL=https://your-frontend.vercel.app
```

**Benefits:**
- ✅ Zero configuration
- ✅ Automatic renewal
- ✅ Global CDN
- ✅ DDoS protection
- ✅ 99.9% uptime SLA

---

## 🥈 Option 2: Nginx Reverse Proxy + Let's Encrypt

### ✅ **Best for: VPS/dedicated servers, full control**

**Quick Setup:**
```bash
# 1. Make the script executable
chmod +x ssl-setup.sh

# 2. Run the automated setup
sudo ./ssl-setup.sh

# Follow the prompts to enter your domain and email
```

**Manual Setup:**
```bash
# Install dependencies
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Use the provided nginx-ssl.conf template
sudo cp nginx-ssl.conf /etc/nginx/sites-available/bluefire
sudo ln -s /etc/nginx/sites-available/bluefire /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Environment Configuration:**
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Backend .env
FRONTEND_URL=https://your-domain.com
```

**Benefits:**
- ✅ Free SSL certificates
- ✅ Full server control
- ✅ Custom configurations
- ✅ Auto-renewal included
- ✅ High performance

---

## 🥉 Option 3: Application-Level SSL

### ✅ **Best for: Advanced users, custom requirements**

**Setup:**
```bash
# 1. Get SSL certificates (Let's Encrypt or commercial)
sudo certbot certonly --standalone -d your-api-domain.com

# 2. Update backend package.json
# Add SSL start script:
"start:ssl": "node dist/main-ssl",

# 3. Use the SSL-enabled main.ts
cp src/main-ssl.ts src/main.ts

# 4. Update certificate paths in main.ts
# Edit the httpsOptions paths to point to your certificates

# 5. Build and start
npm run build
npm run start:ssl
```

**Frontend SSL (using Next.js custom server):**
```javascript
// server.js
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./certificates/private-key.pem'),
  cert: fs.readFileSync('./certificates/certificate.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
```

---

## 🔧 Environment Variables for Each Option

### Option 1: Cloud Platforms
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Backend (.env)
FRONTEND_URL=https://your-frontend.vercel.app
```

### Option 2: Nginx Reverse Proxy
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Backend (.env)
FRONTEND_URL=https://your-domain.com
```

### Option 3: Application-Level SSL
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Backend (.env)
FRONTEND_URL=https://your-domain.com
```

---

## 🚀 Quick Start Commands

### Option 1 (Cloud):
```bash
# Frontend
vercel --prod

# Backend
railway up
```

### Option 2 (Nginx):
```bash
sudo ./ssl-setup.sh
```

### Option 3 (Application):
```bash
npm run build
npm run start:ssl
```

---

## 🔒 Security Checklist

✅ **SSL/TLS Configuration:**
- [ ] TLS 1.2+ only
- [ ] Strong cipher suites
- [ ] HSTS headers
- [ ] Certificate chain valid

✅ **Headers:**
- [ ] Strict-Transport-Security
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Content-Security-Policy

✅ **Monitoring:**
- [ ] SSL expiry monitoring
- [ ] Auto-renewal working
- [ ] Certificate transparency logs

---

## 🆘 Troubleshooting

**Certificate Issues:**
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout

# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Renew certificates manually
sudo certbot renew --force-renewal
```

**Nginx Issues:**
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

**Application Issues:**
```bash
# Check certificate paths
ls -la /path/to/certificates/

# Test HTTPS endpoint
curl -v https://your-domain.com/api/health
```

---

## 📊 Recommendation Summary

| Option | Difficulty | Cost | Control | Best For |
|--------|------------|------|---------|----------|
| Cloud Platforms | 🟢 Easy | 💰 Free-$$ | 🔒 Limited | Production, quick setup |
| Nginx + Let's Encrypt | 🟡 Medium | 💰 Free | 🎛️ Full | VPS, custom needs |
| Application SSL | 🔴 Hard | 💰 Varies | 🎛️ Full | Advanced users |

**Recommended:** Start with **Option 1 (Cloud)** for production, use **Option 2 (Nginx)** for self-hosted deployments.

---

## 🔄 Next Steps After SSL Setup

1. **Update all environment variables** to use HTTPS URLs
2. **Test all functionality** (authentication, API calls, WebSocket connections)
3. **Set up monitoring** for certificate expiry
4. **Configure backup/restore** for certificates
5. **Update DNS records** if needed
6. **Test on multiple devices/browsers**

Your Blue Fire Platform will be secure and production-ready! 🔥🔒 