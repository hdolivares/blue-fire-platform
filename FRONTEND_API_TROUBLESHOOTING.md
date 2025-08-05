# 🔧 Frontend API Connection Troubleshooting

## Common Error: Network Error / SSL Protocol Error

### **Error Messages You Might See:**
```
AxiosError: Network Error
POST https://161.35.225.243:3001/auth/login net::ERR_SSL_PROTOCOL_ERROR
```

### **Root Cause:**
Frontend is trying to connect directly to the backend IP:port instead of using the SSL-enabled domain through Nginx reverse proxy.

---

## ✅ **Fixed Configuration**

### **1. Frontend API URL (Fixed)**
**File**: `frontend/src/config/server.ts`
```typescript
// ✅ CORRECT - Uses SSL domain with /api path
const DEFAULT_API_URL = 'https://app.bluefire.love/api';

// ❌ WRONG - Direct IP connection
// const DEFAULT_API_URL = 'https://161.35.225.243:3001';
```

### **2. Environment Variable**
**File**: `frontend/.env.local`
```bash
# ✅ CORRECT - SSL domain with /api path
NEXT_PUBLIC_API_URL=https://app.bluefire.love/api

# ❌ WRONG - Direct IP
# NEXT_PUBLIC_API_URL=https://161.35.225.243:3001
```

### **3. Web3Context Fix (Fixed)**
**File**: `frontend/src/context/Web3Context.tsx`
```typescript
// ✅ FIXED - Uses API_URL config
await axios.post(`${API_URL}/investments`, data);

// ❌ WAS - Hardcoded localhost
// await axios.post('http://127.0.0.1:3001/investments', data);
```

---

## 🔄 **Correct Request Flow**

### **How It Should Work:**
```
Frontend Code → https://app.bluefire.love/api/auth/login
    ↓
Nginx (SSL termination)
    ↓
Backend → localhost:3001/auth/login
```

### **How It Was Failing:**
```
Frontend Code → https://161.35.225.243:3001/auth/login ❌
    ↓
Direct connection (no SSL, bypasses Nginx)
    ↓
Connection failed
```

---

## 🛠️ **How to Fix on Server**

### **1. Update Frontend Environment**
```bash
# SSH to your server
ssh root@161.35.225.243

# Navigate to your frontend directory
cd /path/to/your/blue-fire-platform/frontend

# Create/update .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://app.bluefire.love/api
EOF
```

### **2. Rebuild Frontend**
```bash
# Rebuild with correct API URL
npm run build

# Restart with PM2
pm2 restart bluefire-app
```

### **3. Verify Configuration**
```bash
# Check if environment variable is set
pm2 logs bluefire-app | grep -i api

# Test API endpoint
curl -I https://app.bluefire.love/api/health
```

---

## 🔍 **Testing Your Fix**

### **1. Browser Network Tab**
- Open DevTools → Network tab
- Try to login
- Look for requests to `https://app.bluefire.love/api/auth/login` ✅
- Should NOT see requests to `161.35.225.243:3001` ❌

### **2. Console Logs**
```javascript
// In browser console, check API URL
console.log(process.env.NEXT_PUBLIC_API_URL);
// Should show: https://app.bluefire.love/api
```

### **3. Test API Directly**
```bash
# Test API endpoint
curl https://app.bluefire.love/api/health

# Should return API response, not SSL error
```

---

## 🚨 **Prevention Checklist**

### **✅ Always Use:**
- `${API_URL}` in axios calls
- Environment variables for API URLs
- SSL domain (`app.bluefire.love`) in production
- `/api` path for backend calls

### **❌ Never Use:**
- Hardcoded IP addresses in frontend code
- Direct port connections in production
- HTTP in production (always HTTPS)
- Localhost URLs in production builds

---

## 🔧 **Quick Fix Commands**

If you see API connection errors:

```bash
# 1. Check current frontend config
ssh root@161.35.225.243
cd /path/to/your/frontend
cat .env.local

# 2. Fix environment variable
echo "NEXT_PUBLIC_API_URL=https://app.bluefire.love/api" > .env.local

# 3. Rebuild and restart
npm run build
pm2 restart bluefire-app

# 4. Test
curl https://app.bluefire.love/api/health
```

Your frontend should now connect properly through the SSL-enabled domain! 🔒✅ 