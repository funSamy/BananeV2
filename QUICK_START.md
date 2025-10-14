# 🚀 Quick Start Guide - BananeV2 Integration

## What Changed?

Your BananeV2 application is now configured as a **single integrated server** where:

✅ Backend serves both API and frontend static files
✅ Everything runs on **one port** (5000 by default)
✅ Can be installed as a **Windows Service** for auto-startup
✅ PWA works seamlessly with the integrated setup

## Architecture

```
Before (2 servers):
- Frontend: http://localhost:3000
- Backend:  http://localhost:5000/api/v1

After (1 server):
- Everything: http://localhost:5000
  ├── /              → Frontend (React app)
  ├── /dashboard     → Frontend routes
  ├── /login         → Frontend routes
  └── /api/v1/*      → Backend API
```

## Quick Commands

### 🔍 Validate Setup

```powershell
.\validate-setup.ps1
```

### 🛠️ Development Mode (Separate Servers)

```powershell
# Terminal 1 - Backend
cd backend
yarn start:dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:5000>

### 🏗️ Production Build

```powershell
# Option 1: Interactive script
.\deploy.ps1

# Option 2: Manual build
cd backend
yarn build:full  # Builds both backend and frontend
```

### 🎯 Test Integrated Setup (Before Service)

```powershell
cd backend
yarn start:prod
```

Then open: <http://localhost:5000>

### 🔧 Windows Service (Production)

**⚠️ Run PowerShell as Administrator**

```powershell
cd backend

# Install and start service
yarn service:install

# Manage service
yarn service:start    # Start
yarn service:stop     # Stop
yarn service:restart  # Restart
yarn service:uninstall # Remove (Admin)
```

## File Structure Changes

### Backend (`backend/src/main.ts`)

- ✅ Added `setGlobalPrefix('api')` - All API routes now under `/api/v1/*`
- ✅ Added static file serving from `frontend/dist`
- ✅ Added SPA fallback for client-side routing
- ✅ Enhanced logging

### Frontend (`.env.production`)

- ✅ Changed API URL to relative path: `/api/v1`
- ✅ Works with same-origin setup

### Windows Service (`backend/src/service/windows-service.ts`)

- ✅ Created service management module
- ✅ Auto-start on Windows boot
- ✅ Runs in background

### Scripts

- ✅ `deploy.ps1` - Interactive deployment script
- ✅ `validate-setup.ps1` - Setup validation
- ✅ `yarn build:full` - Build everything
- ✅ `yarn service:*` - Service management commands

## Testing the Integration

### 1. Build Everything

```powershell
cd backend
yarn build:full
```

### 2. Test Locally

```powershell
yarn start:prod
```

### 3. Verify in Browser

Navigate to <http://localhost:5000>:

- ✅ Frontend loads correctly
- ✅ Can login/logout
- ✅ API calls work (check Network tab)
- ✅ PWA installable

### 4. Install as Service

```powershell
# Run PowerShell as Admin
cd backend
yarn service:install
```

### 5. Verify Service

```powershell
# Check service status
services.msc
# Look for "BananeV2 Production Manager"
```

## Accessing the Application

### After Service Installation

1. Service auto-starts on Windows boot
2. Open browser: <http://localhost:5000>
3. Install PWA (click install button)
4. Launch from desktop/start menu

## Updating the Application

```powershell
# Stop service
cd backend
yarn service:stop

# Make your code changes...

# Rebuild everything
yarn build:full

# Restart service
yarn service:start
```

Or use the deploy script:

```powershell
.\deploy.ps1
# Choose option 7 (Restart Service)
```

## Troubleshooting

### "Port 5000 already in use"

```powershell
# Find what's using the port
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### "Service won't start"

Check logs at:

```
C:\ProgramData\BananeV2 Production Manager\daemon\
```

### "Frontend not loading"

```powershell
# Rebuild frontend
cd frontend
yarn build:production

# Restart service
cd ..\backend
yarn service:restart
```

### "API calls failing"

1. Check browser console for errors
2. Verify API URL in frontend: `/api/v1`
3. Test API directly: <http://localhost:5000/api/v1/auth/login>
4. Check backend logs

## Configuration Files

### Backend Environment (`backend/.env`)

```env
PORT=5000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"
NODE_ENV="production"
```

### Frontend Environment (`frontend/.env.production`)

```env
VITE_API_URL=/api/v1
```

## Benefits of This Setup

1. ✅ **Single Server**: Simpler deployment and management
2. ✅ **Windows Service**: Auto-start on boot, runs in background
3. ✅ **PWA Compatible**: Works perfectly with service workers
4. ✅ **No CORS Issues**: Same-origin requests
5. ✅ **Production Ready**: Optimized builds, proper routing
6. ✅ **Easy Updates**: Stop, rebuild, restart
7. ✅ **Resource Efficient**: One Node.js process instead of two

## Next Steps

1. ✅ Validate setup: `.\validate-setup.ps1`
2. ✅ Build application: `.\deploy.ps1` → Option 1
3. ✅ Test locally: `cd backend && yarn start:prod`
4. ✅ Install service (as Admin): `yarn service:install`
5. ✅ Install PWA in browser
6. ✅ Configure for production (change secrets, enable HTTPS)

## Support

- 📖 Full guide: `DEPLOYMENT_GUIDE.md`
- 🔍 Validation: `.\validate-setup.ps1`
- 🚀 Deployment: `.\deploy.ps1`
- 📝 Main README: `README.md`

---

**Ready to deploy?** Run `.\deploy.ps1` and follow the menu! 🎉
