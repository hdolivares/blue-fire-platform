# 🔒 CORS Configuration for SSL Setup

## Why CORS Matters with SSL

When you switch from HTTP to HTTPS, CORS (Cross-Origin Resource Sharing) configuration becomes critical because:

1. **Protocol Change**: `http://` → `https://` is considered a different origin
2. **Port Changes**: Frontend moves from direct port access to proxied access
3. **Security Headers**: SSL adds additional security requirements

## 🔧 Updated CORS Configuration

### Before SSL (Development):
```javascript
// Backend CORS
origin: 'http://app.bluefire.love'  // or localhost:8080
```

### After SSL (Production):
```javascript
// Backend CORS  
origin: 'https://app.bluefire.love'  // HTTPS required
```

## 📝 Configuration Changes Made

### 1. Backend Server Config Updated
**File**: `backend/src/config/server.ts`
```typescript
// Changed from:
const DEFAULT_FRONTEND_URL = 'http://app.bluefire.love';

// To:
const DEFAULT_FRONTEND_URL = 'https://app.bluefire.love';
```

### 2. Environment Variables
**Production**: `backend/.env`
```bash
FRONTEND_URL=https://app.bluefire.love  # HTTPS for CORS
NODE_ENV=production
PORT=3001
```

### 3. Enhanced Production Config
**File**: `backend/src/main-production.ts` (optional upgrade)
- Environment-based CORS origins
- Additional proxy headers for SSL
- Enhanced security headers

## 🔄 Request Flow with SSL

```
User Browser → https://app.bluefire.love
    ↓
Nginx (SSL termination) → localhost:8080 (Frontend)
    ↓
Frontend makes API call → https://app.bluefire.love/api/
    ↓
Nginx proxies → localhost:3001 (Backend)
    ↓
Backend checks CORS → origin: 'https://app.bluefire.love' ✅
```

## ✅ CORS Headers Added

The backend now includes these headers for SSL:
```
Access-Control-Allow-Origin: https://app.bluefire.love
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: X-Forwarded-Proto, X-Real-IP
```

## 🆘 Troubleshooting CORS Issues

### Common Error:
```
Access to fetch at 'https://app.bluefire.love/api/...' 
from origin 'https://app.bluefire.love' has been blocked by CORS policy
```

### Solutions:

#### 1. Check Backend Environment
```bash
# On your server
cd /var/www/bluefire/backend
cat .env | grep FRONTEND_URL
# Should show: FRONTEND_URL=https://app.bluefire.love
```

#### 2. Verify Backend Logs
```bash
pm2 logs bluefire-api
# Look for: "Frontend URL: https://app.bluefire.love"
```

#### 3. Test CORS Headers
```bash
curl -I -X OPTIONS https://app.bluefire.love/api/health \
  -H "Origin: https://app.bluefire.love" \
  -H "Access-Control-Request-Method: GET"
```

#### 4. Restart Backend if Needed
```bash
pm2 restart bluefire-api
```

## 🔍 Browser Testing

### Check CORS in Browser DevTools:
1. Open `https://app.bluefire.love`
2. Open DevTools → Network tab
3. Make an API call (login, etc.)
4. Look for CORS headers in response

### Expected Headers:
```
access-control-allow-origin: https://app.bluefire.love
access-control-allow-credentials: true
access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

## 🚨 Important Notes

### ✅ Do:
- Use `https://` in all production CORS origins
- Set `NODE_ENV=production` in backend `.env`
- Include `credentials: true` for authentication
- Add proxy headers for SSL termination

### ❌ Don't:
- Mix HTTP and HTTPS origins
- Use wildcard `*` origin with credentials
- Forget to restart backend after env changes
- Skip the `trust proxy` setting for production

## 🔧 Quick Fix Commands

If you encounter CORS issues after SSL setup:

```bash
# 1. Check current config
ssh root@161.35.225.243
cd /var/www/bluefire/backend
cat .env

# 2. Update if needed
echo "FRONTEND_URL=https://app.bluefire.love" >> .env

# 3. Restart backend
pm2 restart bluefire-api

# 4. Test CORS
curl -I https://app.bluefire.love/api/health
```

Your CORS configuration is now properly set up for SSL! 🔒✅ 