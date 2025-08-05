# 🔧 Port Configuration for SSL Setup

## Why Port 8080 for Frontend?

Since you're setting up SSL with Nginx as a reverse proxy, here's how the ports work:

### **External (Public) Ports:**
- **Port 80** (HTTP) → Nginx → Redirects to HTTPS
- **Port 443** (HTTPS) → Nginx → SSL termination

### **Internal (Application) Ports:**
- **Port 8080** → Next.js Frontend (internal only)
- **Port 3001** → NestJS Backend API (internal only)

## 🔄 Traffic Flow:

```
Internet → app.bluefire.love:443 (HTTPS)
    ↓
Nginx (SSL termination)
    ↓
Frontend: localhost:8080 (Next.js)
API calls: localhost:3001 (NestJS)
```

## 📝 Updated Configuration:

### Frontend Package.json:
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 8080",
    "start": "next start -p 8080"
  }
}
```

### Nginx Configuration:
```nginx
# External HTTPS (443) → Internal Frontend (8080)
location / {
    proxy_pass http://localhost:8080;
}

# External HTTPS (443/api/) → Internal Backend (3001)
location /api/ {
    proxy_pass http://localhost:3001/;
}
```

## ✅ Benefits:

1. **Security**: Only Nginx exposed to internet
2. **SSL Termination**: Nginx handles all SSL/TLS
3. **Flexibility**: Easy to add load balancing, caching
4. **Standard Practice**: Industry standard reverse proxy setup

## 🚀 Result:

- **Public URL**: `https://app.bluefire.love` (automatic SSL)
- **API URL**: `https://app.bluefire.love/api/` (automatic SSL)
- **Internal Apps**: Protected behind Nginx proxy

Your applications run internally on 8080 and 3001, but users access everything securely through HTTPS on the standard port 443! 🔒 