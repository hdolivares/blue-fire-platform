# 🔥 Simple Ubuntu SSL Setup - Blue Fire Platform

## You're Right - No Need for /var/www!

Nginx just reverse proxies to your running apps. Code can live anywhere.

---

## 🚀 **Quick Setup (3 Steps)**

### **Step 1: Get Code on Server**
```bash
# SSH to your server
ssh root@161.35.225.243

# Clone your code anywhere you want
git clone your-repo-url blue-fire-platform
# OR upload: scp -r . root@161.35.225.243:blue-fire-platform/
```

### **Step 2: Setup SSL & Nginx**
```bash
# Upload and run SSL setup script
scp deploy-ssl.sh root@161.35.225.243:/root/
ssh root@161.35.225.243
chmod +x deploy-ssl.sh
./deploy-ssl.sh
# Enter your email when prompted
```

**This creates:**
- Nginx reverse proxy: `443 → localhost:8080` (frontend)
- Nginx API proxy: `443/api/ → localhost:3001` (backend)
- SSL certificate for `app.bluefire.love`

### **Step 3: Start Your Apps**
```bash
# Navigate to your code (wherever you put it)
cd blue-fire-platform

# Backend
cd backend
echo "FRONTEND_URL=https://app.bluefire.love
PORT=3001
NODE_ENV=production" > .env

npm install && npm run build
pm2 start dist/main.js --name bluefire-api

# Frontend  
cd ../frontend
echo "NEXT_PUBLIC_API_URL=https://app.bluefire.love/api" > .env.local

npm install && npm run build
pm2 start npm --name bluefire-app -- start

# Save PM2 config
pm2 save && pm2 startup
```

---

## ✅ **That's It!**

### **How It Works:**
```
Internet → https://app.bluefire.love
    ↓
Nginx (SSL + Reverse Proxy)
    ↓
Your Apps: localhost:8080 & localhost:3001
(Running from any directory you choose)
```

### **Test Your Setup:**
- Visit: `https://app.bluefire.love` 
- API: `https://app.bluefire.love/api/health`
- Check: `pm2 status`

### **Key Points:**
- ✅ **Code location**: Anywhere you want
- ✅ **Nginx proxies**: To localhost ports only
- ✅ **SSL automatic**: Let's Encrypt + auto-renewal
- ✅ **PM2 manages**: Your app processes

**No need to follow old web server conventions - reverse proxy FTW!** 🎯 