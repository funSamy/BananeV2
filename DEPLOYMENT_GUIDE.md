# BananeV2 - Integrated Deployment Guide

This guide explains how to deploy BananeV2 as a single integrated application with the backend serving the frontend, and how to set it up as a Windows service.

## Architecture Overview

The application is now configured as a **single-server architecture**:

- **Backend (NestJS)**: Runs on port 5000 (configurable)
- **Frontend (React/Vite)**: Built as static files and served by the backend
- **API Routes**: All API endpoints are under `/api/v1/*`
- **Frontend Routes**: Everything else (`/`, `/login`, `/dashboard`, etc.) serves the React app

```
┌─────────────────────────────────────────┐
│         BananeV2 Application            │
│  (Single Node.js Process on Port 5000) │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  NestJS Backend (API Server)      │ │
│  │  Routes: /api/v1/*                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Static File Server               │ │
│  │  Serves: React SPA (built files)  │ │
│  │  Routes: /, /dashboard, etc.      │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## Prerequisites

- **Node.js**: v18 or higher
- **Yarn**: Package manager
- **Windows OS**: For Windows service functionality
- **Administrator privileges**: Required for service installation

## Step 1: Build the Application

### 1.1 Build Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Build for production
yarn build:production
```

This creates optimized static files in `frontend/dist/`

### 1.2 Build Backend

```powershell
# Navigate to backend directory
cd ..\backend

# Install dependencies
yarn install

# Build backend (includes database migration)
yarn build
```

This creates the compiled backend in `backend/dist/`

### 1.3 Build Everything at Once

```powershell
# From backend directory
yarn build:full
```

This command builds both backend and frontend in one go.

## Step 2: Test the Integrated Application

Before setting up as a service, test that everything works:

```powershell
# From backend directory
yarn start:prod
```

Then open your browser and navigate to:

- **Application**: <http://localhost:5000>
- **API Health Check**: <http://localhost:5000/api/v1/auth/health> (if you have a health endpoint)

You should see the React frontend loading. The PWA should also be installable.

## Step 3: Set Up as Windows Service

### 3.1 Install the Service

**⚠️ Important**: Run PowerShell as Administrator

```powershell
# From backend directory (as Administrator)
cd backend
yarn service:install
```

This will:

1. Register "BananeV2 Production Manager" as a Windows service
2. Configure it to run on system startup
3. Automatically start the service

### 3.2 Verify Service Installation

Open Windows Services manager:

```powershell
services.msc
```

Look for **"BananeV2 Production Manager"** in the list. It should be:

- **Status**: Running
- **Startup Type**: Automatic

### 3.3 Service Management Commands

```powershell
# Start the service
yarn service:start

# Stop the service
yarn service:stop

# Restart the service
yarn service:restart

# Uninstall the service (run as Administrator)
yarn service:uninstall
```

## Step 4: Configure the Service

### Port Configuration

By default, the service runs on port 5000. To change:

1. Create or edit `backend/.env`:

   ```env
   PORT=8080
   DATABASE_URL="your-database-url"
   JWT_SECRET="your-jwt-secret"
   ```

2. Restart the service:

   ```powershell
   yarn service:restart
   ```

### Database Configuration

Make sure your `.env` file has the correct database connection:

```env
DATABASE_URL="file:./dev.db"  # For SQLite
# OR
DATABASE_URL="postgresql://user:password@localhost:5432/banane"  # For PostgreSQL
```

## Step 5: Access the Application

Once the service is running:

1. **Open Application**: Navigate to `http://localhost:5000` in your browser
2. **Install PWA**:
   - Click the install button in your browser's address bar
   - Or use the install prompt in the app
3. **Use PWA**: After installation, launch the app from:
   - Desktop shortcut
   - Start menu
   - Windows taskbar (if pinned)

The service runs in the background, so the app will always be available!

## Troubleshooting

### Service Won't Start

Check the service logs:

```powershell
# Logs are stored in:
C:\ProgramData\BananeV2 Production Manager\daemon\
```

Common issues:

- **Port already in use**: Change the PORT in `.env`
- **Database connection failed**: Check DATABASE_URL
- **Missing dependencies**: Run `yarn install` in backend directory

### Frontend Not Loading

1. Verify frontend is built:

   ```powershell
   ls ..\frontend\dist
   ```

2. Rebuild if needed:

   ```powershell
   cd ..\frontend
   yarn build:production
   cd ..\backend
   yarn service:restart
   ```

### API Requests Failing

1. Check API is responding:

   ```powershell
   curl http://localhost:5000/api/v1/auth/login -v
   ```

2. Verify CORS configuration in `backend/src/main.ts`

3. Check frontend API configuration:
   - Development: `frontend/.env.development`
   - Production: `frontend/.env.production`

### Database Migration Issues

If you get database errors:

```powershell
# From backend directory
yarn migrate
yarn service:restart
```

## Updating the Application

When you make changes:

1. **Stop the service**:

   ```powershell
   yarn service:stop
   ```

2. **Rebuild**:

   ```powershell
   yarn build:full
   ```

3. **Restart the service**:

   ```powershell
   yarn service:start
   ```

Or use the restart command:

```powershell
yarn build:full
yarn service:restart
```

## Uninstalling

To completely remove the service:

```powershell
# Run as Administrator
yarn service:stop
yarn service:uninstall
```

## Security Considerations

### Production Checklist

- [ ] Change default JWT_SECRET in `.env`
- [ ] Use strong database credentials
- [ ] Enable HTTPS (use reverse proxy like nginx or IIS)
- [ ] Configure firewall rules
- [ ] Set up proper Windows service account (not Local System)
- [ ] Enable logging and monitoring
- [ ] Regular backups of database
- [ ] Keep Node.js and dependencies updated

### Recommended: Set Up HTTPS

For production, use IIS or nginx as a reverse proxy:

```
[Browser] --HTTPS--> [IIS/nginx:443] --HTTP--> [Node.js:5000]
```

## Performance Tips

1. **Increase Node.js memory** (edit `src/service/windows-service.ts`):

   ```typescript
   nodeOptions: ['--max_old_space_size=8192']
   ```

2. **Enable PM2 for production** (alternative to Windows service):

   ```powershell
   npm install -g pm2
   pm2 start dist/main.js --name banane-v2
   pm2 startup windows
   pm2 save
   ```

3. **Database optimization**:
   - Use connection pooling
   - Add proper indexes
   - Regular maintenance

## Support

For issues or questions:

- Check logs in service daemon folder
- Review error messages in Windows Event Viewer
- Ensure all dependencies are installed
- Verify Node.js version compatibility

## Next Steps

- Configure automated backups
- Set up monitoring (e.g., with Winston + external service)
- Implement health check endpoints
- Configure log rotation
- Set up alerts for service failures
