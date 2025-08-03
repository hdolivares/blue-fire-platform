# Server Configuration Guide

This project now uses centralized server configuration files to manage API and frontend URLs across the entire application.

## Configuration Files

### Frontend: `frontend/src/config/server.ts`
- Manages API server URL for frontend components
- Uses `NEXT_PUBLIC_API_URL` environment variable
- Default: `http://localhost:3001`

### Backend: `backend/src/config/server.ts`
- Manages frontend URL for backend services
- Uses `FRONTEND_URL` environment variable
- Default: `http://localhost:3000`

## Environment Variables

### Frontend Environment Variables
Create or update `frontend/.env.local`:
```bash
# API Server URL (backend)
NEXT_PUBLIC_API_URL=http://your-server-ip:3001
```

### Backend Environment Variables
Create or update `backend/.env`:
```bash
# Frontend URL (for CORS and email links)
FRONTEND_URL=http://your-server-ip:3000
```

## Usage Examples

### Setting Custom Server IPs

**For local development with specific IP:**
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=http://192.168.1.100:3001

# Backend .env
FRONTEND_URL=http://192.168.1.100:3000
```

**For production deployment:**
```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=https://api.yourproject.com

# Backend .env
FRONTEND_URL=https://yourproject.com
```

## Files Updated

### Frontend Files
- `src/config/server.ts` (new)
- `src/lib/axios.ts`
- `src/components/admin/CreateProjectForm.tsx`
- `src/components/admin/SyncControls.tsx`
- `src/components/admin/ProjectManagement.tsx`
- `src/context/Web3Context.tsx`
- `src/app/reset-password/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/dashboard/projects/[id]/page.tsx`

### Backend Files
- `src/config/server.ts` (new)
- `src/main.ts`
- `src/email/email.service.ts`

## Benefits

1. **Centralized Configuration**: All server URLs managed in one place per application
2. **Environment-Based**: Easy switching between development, staging, and production
3. **Consistent Pattern**: Follows the same pattern as `blockchain.ts` configuration
4. **Easy Deployment**: Simple environment variable changes for different environments

## Migration from Localhost

The default values remain `localhost` for backward compatibility. To switch to a different server:

1. Set the appropriate environment variables
2. Restart the applications
3. All API calls will automatically use the new URLs

No code changes required - just environment configuration! 